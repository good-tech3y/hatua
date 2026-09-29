import { Audio } from 'expo-av';

let whoosh: Audio.Sound | null = null;
let pop: Audio.Sound | null = null;

async function load() {
  if (!whoosh) {
    const w = new Audio.Sound();
    await w.loadAsync(require('../../assets/sounds/whoosh.wav'));
    whoosh = w;
  }
  if (!pop) {
    const p = new Audio.Sound();
    await p.loadAsync(require('../../assets/sounds/pop.wav'));
    pop = p;
  }
}

export async function playWhoosh() {
  try { await load(); await whoosh?.replayAsync(); } catch {}
}
export async function playPop() {
  try { await load(); await pop?.replayAsync(); } catch {}
}
