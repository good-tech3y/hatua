<h1 align="center">Hatua</h1>

<p align="center">Type one goal. Hatua turns it into a game, and only real progress ever counts.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&amp;logo=expo&amp;logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&amp;logo=typescript&amp;logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&amp;logo=react&amp;logoColor=61DAFB" alt="React Native">
  <img src="https://img.shields.io/badge/RevenueCat-F25A5A?style=for-the-badge&amp;logo=revenuecat&amp;logoColor=white" alt="RevenueCat">
  <img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&amp;logo=groq&amp;logoColor=white" alt="Groq">
</p>

## A little about me

I am Hatua, which means "a step" in Swahili. I turn one goal into a path of short quests and a small world to explore. I do not count words for their own sake. My hero grows only from check-ins the judge considers genuine progress.

* One goal. One path. Real steps.

## What I do

Start with one goal. Groq turns it into 5 to 7 short quest milestones, naming each one without teaching or explaining how to do it. Walk through a small low-poly world, check in each day with an honest account of what you did, and watch a lantern light when you complete a quest.

## Why Hatua is different

The AI judge considers the specificity and consistency of each check-in. Vague, generic, or copy-pasted answers do not count as progress. It judges what you wrote and how it fits your check-in history. It cannot prove that a claim is literally true.

## Features

- Turn one personal goal into 5 to 7 short quest milestones.
- Explore a small low-poly world where a lit lantern marks each completed quest.
- Check in each day with a short, honest description of what you actually did.
- Optionally attach a photo as proof.
- Grow a custom low-poly hero with customizable colors. The hero and world are hand-built SVG art, not stock icon or illustration packs.
- Explore four realms, unlocked with Pro or during the free trial.
- Earn 10 achievements computed from real check-in history.
- View your name, hero, and lifetime stats on your profile, including your streak, best streak, real days, and achievements.

## Built with

Hatua is an Android app built with Expo, Expo Router, React Native, and TypeScript. Zustand keeps app state persisted on-device with AsyncStorage. Custom animation and art use react-native-reanimated and react-native-svg. RevenueCat handles subscriptions. Groq powers the AI judge through a serverless function, so the Groq API key never ships in the app. Optional photo proof uses expo-image-picker and expo-file-system, with photos kept on-device except when a player chooses to send one for AI judgment.

## How RevenueCat is used

Every new player gets a 30-day free trial with everything unlocked. No purchase is needed to try Hatua. After the trial, players can choose a monthly or yearly subscription. There is no lifetime tier.

Subscriptions can unlock realms and hero colors. Progress, XP, and levels can never be bought.

## Privacy

Player-created data stays on the player's phone. Check-in text is sent to the AI judge, and a photo is sent only if the player chooses to attach one. The information is sent only for judgment and is never stored server-side. Hatua has no accounts, ads, or analytics.

## Run it locally

Install dependencies, then start Expo:

```sh
npm install
npm start
```

To start the Android target directly, use `npm run android`.

The app runs in a fully offline demo mode with a built-in fallback judge when no live judge URL is configured. To use the live AI judge, set `EXPO_PUBLIC_AI_URL` for the app and set `GROQ_API_KEY` as an environment variable on the server that serves `/quests` and `/judge`.

## License

Hatua is licensed under the MIT License. See [LICENSE](LICENSE).

Built for RevenueCat Shipaton 2026 in the Next Gen Award track.

Thanks for taking a step with me. See you out there,

Hatua
