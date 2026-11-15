"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  COPILOT_IMAGE_OUTPUT_STANDARD,
  QC_TOTE_VISUAL_STANDARD,
  type ArticleImagePlan,
  type ArticlePackage,
} from "@/lib/articlePackageContract";

type SelectedImages = Record<string, File | undefined>;
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function validatePackage(value: unknown): ArticlePackage {
  if (!value || typeof value !== "object") throw new Error("The selected file is not a valid article package.");
  const article = value as Partial<ArticlePackage>;
  if (article.version != null && ![1, 2, 3].includes(article.version)) throw new Error("This article package version is not supported.");
  if (!article.title?.trim()) throw new Error("The article package is missing a title.");
  if (!article.contentHtml?.trim()) throw new Error("The article package is missing article content.");
  const ids = new Set<string>();
  for (const image of article.images ?? []) {
    if (!image.id?.trim()) throw new Error("Every image recommendation must have an id.");
    if (ids.has(image.id)) throw new Error(`The image id "${image.id}" is duplicated.`);
    if (!['featured','body'].includes(image.kind)) throw new Error(`The image recommendation "${image.id}" has an unsupported kind.`);
    ids.add(image.id);
  }
  return article as ArticlePackage;
}

function addTableOfContents(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll('[data-article-toc="true"]').forEach((node) => node.remove());
  const headings = Array.from(doc.body.querySelectorAll("h2"));
  const used = new Set<string>();
  headings.forEach((heading, index) => {
    const base = slugify(heading.textContent ?? "") || `section-${index + 1}`;
    let id = base, suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id); heading.id = id;
  });
  if (headings.length >= 2) {
    const nav = doc.createElement("nav"); nav.dataset.articleToc = "true"; nav.className = "article-toc"; nav.setAttribute("aria-label", "Table of contents");
    const title = doc.createElement("p"); title.className = "article-toc-title"; title.textContent = "In this article"; nav.append(title);
    const list = doc.createElement("ol");
    headings.forEach((heading) => { const li=doc.createElement("li"); const a=doc.createElement("a"); a.href=`#${heading.id}`; a.textContent=heading.textContent?.trim() || "Article section"; li.append(a); list.append(li); });
    nav.append(list); headings[0].before(nav);
  }
  return doc.body.innerHTML;
}

function fileExtension(file: File) {
  const ext=file.name.split('.').pop()?.toLowerCase();
  if (ext && /^[a-z0-9]+$/.test(ext)) return ext;
  return ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'} as Record<string,string>)[file.type] ?? 'img';
}
async function uploadImage(file: File, slug: string, slot: string) {
  const date=new Date().toISOString().slice(0,10).replaceAll('-','');
  const renamed=new File([file],`${slugify(slug)||'article'}--${slugify(slot)||'image'}--${date}.${fileExtension(file)}`,{type:file.type,lastModified:file.lastModified});
  const data=new FormData(); data.append('file',renamed);
  const response=await fetch('/api/admin/images',{method:'POST',body:data}); const result=await response.json().catch(()=>({}));
  if(!response.ok||!result?.url) throw new Error(result?.error||`The image "${renamed.name}" could not be uploaded.`);
  return String(result.url);
}
function replaceMarkers(html:string, plans:ArticleImagePlan[], urls:Record<string,string>) {
  const doc=new DOMParser().parseFromString(html,'text/html'); const byId=new Map(plans.filter(x=>x.kind==='body').map(x=>[x.id,x]));
  const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_COMMENT); const comments:Comment[]=[]; let node=walker.nextNode();
  while(node){comments.push(node as Comment);node=walker.nextNode();}
  for(const comment of comments){const match=/^\s*ARTICLE_IMAGE:([a-zA-Z0-9_-]+)\s*$/.exec(comment.data);if(!match)continue;const plan=byId.get(match[1]);const url=urls[match[1]];if(!plan||!url){comment.remove();continue;}const img=doc.createElement('img');img.src=url;img.alt=plan.altText??'';img.loading='lazy';img.style.cssText=`display:block;width:${plan.width??75}%;max-width:100%;height:auto;margin:1.5rem auto;`;const paragraph=doc.createElement('p');paragraph.append(img);comment.replaceWith(paragraph);}
  return doc.body.innerHTML;
}
function promptFor(image:ArticleImagePlan){const parts=[`Generate an image of: ${image.generationPrompt?.trim()||image.recommendation?.trim()||'a polished image for this article'}`];if(image.useQcToteVisualStandard||image.useQcToteReference)parts.push(QC_TOTE_VISUAL_STANDARD);parts.push(COPILOT_IMAGE_OUTPUT_STANDARD);return parts.join('\n\n');}

function Preview({file,alt}:{file:File;alt:string}){const[url,setUrl]=useState('');useEffect(()=>{const next=URL.createObjectURL(file);setUrl(next);return()=>URL.revokeObjectURL(next)},[file]);return url?<img src={url} alt={alt} className="mt-3 max-h-80 w-full rounded-lg object-contain"/>:null;}

export default function ArticlePackageImporter({initialPackage=null,packageName}:{initialPackage?:ArticlePackage|null;packageName?:string}){
  const inputRef=useRef<HTMLInputElement>(null);const imageRefs=useRef<Record<string,HTMLInputElement|null>>({});const lock=useRef(false);
  const[articlePackage,setPackage]=useState<ArticlePackage|null>(()=>initialPackage?validatePackage(initialPackage):null);const[name,setName]=useState(packageName??(initialPackage?'Prepared from publishing calendar':''));const[images,setImages]=useState<SelectedImages>({});const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
  async function load(file:File){try{setPackage(validatePackage(JSON.parse(await file.text())));setName(file.name);setImages({});setMessage('')}catch(error){setPackage(null);setName('');setMessage(error instanceof Error?error.message:'The package could not be loaded.')}finally{if(inputRef.current)inputRef.current.value=''}}
  async function createDraft(){if(!articlePackage||lock.current)return;lock.current=true;setBusy(true);setMessage('Creating draft and uploading selected images...');try{for(const plan of articlePackage.images??[])if(plan.required&&!images[plan.id])throw new Error(`Choose an image for "${plan.recommendation}" before creating the draft.`);const slug=slugify(articlePackage.slug?.trim()||articlePackage.title);if(!slug)throw new Error('The article package could not create a valid slug.');const urls:Record<string,string>={};for(const plan of articlePackage.images??[]){const file=images[plan.id];if(file)urls[plan.id]=await uploadImage(file,slug,plan.id)}const featured=(articlePackage.images??[]).find(x=>x.kind==='featured');const imageUrl=featured?(urls[featured.id]??articlePackage.imageUrl??''):(articlePackage.imageUrl??'');let contentHtml=replaceMarkers(articlePackage.contentHtml,articlePackage.images??[],urls);if(articlePackage.includeTableOfContents!==false)contentHtml=addTableOfContents(contentHtml);const response=await fetch('/api/admin/articles',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:articlePackage.title,slug,subtitle:articlePackage.subtitle??'',category:articlePackage.category??'Moving Tips',authorName:articlePackage.authorName??'QC Tote Rental Editorial Team',imageUrl,readTime:articlePackage.readTime??'',metaTitle:articlePackage.metaTitle??articlePackage.title,metaDescription:articlePackage.metaDescription??articlePackage.subtitle??'',facebookBlurb:articlePackage.facebookBlurb??'',facebookPostingEnabled:false,facebookPostStatus:'NOT_REQUESTED',contentHtml,publishedAt:null})});const result=await response.json().catch(()=>({}));if(!response.ok||!result?.externalId)throw new Error(result?.error||'The article package could not be imported.');window.location.assign(`/admin/articles/${encodeURIComponent(result.externalId)}`)}catch(error){lock.current=false;setBusy(false);setMessage(error instanceof Error?error.message:'The article package could not be imported.')}}
  return <section className="mb-8 rounded-2xl border border-lime-300 bg-lime-50 p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-black">{initialPackage?'Prepared article package':'Import article package'}</h2><p className="mt-1 text-sm text-slate-600">Review prompts, upload selected images, and create a draft.</p></div><input ref={inputRef} type="file" accept="application/json,.json" className="hidden" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void load(file)}}/><button type="button" disabled={busy} onClick={()=>inputRef.current?.click()} className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white">{articlePackage?'Choose a different package':'Choose article package'}</button></div>{articlePackage?<div className="mt-6 space-y-5"><div className="rounded-xl bg-white p-5"><p className="text-xs font-bold uppercase text-lime-700">Loaded package</p><h3 className="mt-2 text-2xl font-black">{articlePackage.title}</h3><p className="text-sm text-slate-500">{name}</p>{articlePackage.facebookBlurb?<div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4"><p className="font-bold text-blue-900">Proposed Facebook blurb</p><p className="mt-2 text-sm text-slate-700">{articlePackage.facebookBlurb}</p><p className="mt-2 text-xs text-slate-500">Posting remains off until approved in the article editor.</p></div>:null}</div>{(articlePackage.images??[]).map((image,index)=>{const file=images[image.id];return <div key={image.id} className="rounded-xl border bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">{index+1}. {image.kind} image {image.required?'• Required':'• Optional'}</p><p className="mt-2 font-bold">{image.recommendation}</p><pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">{promptFor(image)}</pre><button type="button" className="mt-3 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white" onClick={()=>void navigator.clipboard.writeText(promptFor(image))}>Copy prompt</button><input ref={el=>{imageRefs.current[image.id]=el}} type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e:ChangeEvent<HTMLInputElement>)=>{const next=e.target.files?.[0];if(next)setImages(current=>({...current,[image.id]:next}));e.target.value=''}}/>{file?<><Preview file={file} alt={image.altText??image.recommendation}/><button type="button" className="mt-3 font-bold underline" onClick={()=>imageRefs.current[image.id]?.click()}>Replace image</button></>:<button type="button" className="mt-3 rounded-lg border px-4 py-2 font-bold" onClick={()=>imageRefs.current[image.id]?.click()}>Upload selected image</button>}</div>})}<button type="button" disabled={busy} onClick={()=>void createDraft()} className="rounded-lg bg-lime-400 px-6 py-3 font-black disabled:opacity-60">{busy?'Creating draft...':'Create draft'}</button></div>:null}{message?<p className="mt-4 text-sm font-semibold text-red-700">{message}</p>:null}</section>;
}
