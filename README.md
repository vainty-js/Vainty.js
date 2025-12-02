<div align="center">
  <br />
  <p>
    <img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" />
  </p>
  <br />
  <p>
    <img src="https://img.shields.io/npm/v/discord.js.svg?maxAge=3600" alt="NPM version" />
    <img src="https://img.shields.io/npm/dt/discord.js.svg?maxAge=3600" alt="NPM downloads" />
    <img src="https://travis-ci.org/discordjs/discord.js.svg" alt="Build status" />
    <img src="https://img.shields.io/david/discordjs/discord.js.svg?maxAge=3600" alt="Dependencies" />
  </p>
  <p>
    <img src="https://nodei.co/npm/discord.js.png?downloads=true&stars=true" alt="NPM info" />
  </p>
</div>

# Vainty.js

## 📖 About
**Vainty.js** est un module Node.js permettant d’interagir avec l’API Discord de manière simple et performante.  
Ce fork a été entièrement réécrit pour offrir une expérience **minimaliste, robuste et ergonomique**, adaptée aux besoins des utilisateurs avancés.

- Object-based config pour un contrôle total  
- Syntaxe prévisible et claire  
- Performances optimisées  
- Couverture complète des endpoints Discord API  

## ⚙️ Installation
**Node.js 22.0.0 ou plus récent est requis.**  
Ignorez les avertissements concernant les peer dependencies, ils sont optionnels.

Sans support vocal :
```bash
npm install vainty.js
```

Avec support vocal via [@discordjs/opus](https://www.npmjs.com/package/@discordjs/opus) :
```bash
npm install vainty.js @discordjs/opus
```

Avec support vocal via [opusscript](https://www.npmjs.com/package/opusscript) :
```bash
npm install vainty.js opusscript
```

### 🔊 Audio engines
- **Préféré** : `@discordjs/opus` (meilleures performances)  
- **Alternative dev** : `opusscript` (utile si `@discordjs/opus` est difficile à compiler)  

### 📦 Optional packages
- [bufferutil](https://www.npmjs.com/package/bufferutil) → accélère le WebSocket  
- [erlpack](https://github.com/hammerandchisel/erlpack) → sérialisation plus rapide  
- [sodium](https://www.npmjs.com/package/sodium) ou [libsodium.js](https://www.npmjs.com/package/libsodium-wrappers) → chiffrement/déchiffrement vocal plus rapide  

## 🚀 Example usage
```js
const Discord = require('vainty.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.login('token');
```

## Documentation (Coming Soon)