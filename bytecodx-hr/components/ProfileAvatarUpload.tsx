"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ProfileAvatarUpload({ initialUrl, name }: { initialUrl: string | null; name: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl ?? "");
  const [cropY, setCropY] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setError("");
    setMessage("");
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/") || nextFile.size > 8 * 1024 * 1024) {
      setError("Choose an image no larger than 8 MB.");
      return;
    }
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const source = await createImageBitmap(file);
      const side = Math.min(source.width, source.height);
      const cropX = (source.width - side) / 2;
      const cropOffsetY = (source.height - side) * (cropY / 100);
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image editor is not available in this browser.");
      context.drawImage(source, cropX, cropOffsetY, side, side, 0, 0, 512, 512);
      source.close();
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("The image could not be cropped.")), "image/webp", 0.9);
      });
      if (blob.size > 4 * 1024 * 1024) throw new Error("The cropped image is too large. Choose a smaller source image.");
      const formData = new FormData();
      formData.set("image", blob, "profile.webp");
      const response = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Profile photo could not be saved.");
      setPreviewUrl(`${result.avatarUrl}?v=${Date.now()}`);
      setFile(null);
      setMessage("Profile photo updated.");
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Profile photo could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5 md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-cyan-300/30 bg-white/5">
          {previewUrl ? <Image src={previewUrl} alt={`${name} profile photo preview`} fill unoptimized className="object-cover" style={{ objectPosition: `50% ${cropY}%` }} /> : <div className="flex h-full items-center justify-center text-3xl font-semibold text-cyan-200">{name.slice(0, 1)}</div>}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Profile photo</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">{name}</h2>
          <p className="mt-1 text-sm text-slate-400">Choose an image and adjust the vertical crop before saving. Maximum source size: 8 MB.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-3">
          <label className="block space-y-2 text-xs text-slate-300">Choose image<input onChange={chooseFile} type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" /></label>
          {file ? <label className="block space-y-2 text-xs text-slate-300">Vertical crop<input type="range" min="0" max="100" value={cropY} onChange={(event) => setCropY(Number(event.target.value))} className="w-full accent-cyan-400" /></label> : null}
        </div>
        <button type="submit" disabled={!file || busy} className="interactive-button interactive-button--primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{busy ? "Saving…" : "Save photo"}</button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p> : null}
      {message ? <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p> : null}
    </section>
  );
}
