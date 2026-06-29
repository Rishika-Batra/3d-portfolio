const { NodeIO, Document } = require('@gltf-transform/core');

async function merge() {
  const io = new NodeIO();
  
  const idleDoc = await io.read('character.glb');
  const typingDoc = await io.read('megan_typing.glb');
  
  // Rename animations
  idleDoc.getRoot().listAnimations()[0].setName('introAnimation');
  typingDoc.getRoot().listAnimations()[0].setName('typing');

  console.log('Writing idle GLB with renamed animation...');
  await io.write('character_merged.glb', idleDoc);
  console.log('Done!');
}

merge().catch(console.error);
