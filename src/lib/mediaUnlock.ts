// One-time media playback unlock for mobile autoplay policies.
// Must be called synchronously inside a real user gesture (a tap/click), so the
// browser grants this session permission to play muted inline video later
// (after the countdown, or a timer timeout, where no fresh tap exists).

let unlocked = false;

// unlockMediaPlayback — call inside a tap handler (e.g. "Let's go", "Join & play")
export function unlockMediaPlayback(): void {
  if (unlocked || typeof document === "undefined") return;
  unlocked = true;
  try {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    // 1x1 silent video data URI; tiny, just to flip the media-activation bit.
    v.src =
      "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAGm1kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAAAAAAAAAAAAAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAB9HRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAEAAAABAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAEAAAAAAAABAAAAAAFsbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAB1MAAAAAAVxwAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABF21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAANdzdGJsAAAAl3N0c2QAAAAAAAAAAQAAAIdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAEAAQBIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFNQAr/4QAYZ01ACuiPyy4C2QAAAwABAAADAAIPEiUWAQAGaOPjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAEAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAArsAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU3LjU2LjEwMQ==";
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.then(() => v.pause()).catch(() => {});
    }
  } catch {
    /* best effort */
  }
}
