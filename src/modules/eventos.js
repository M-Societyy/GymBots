function registrarEventosMineflayer ({ bot, contexto }) {
  const logger = contexto.logger

  const eventos = [
    'connect',
    'inject_allowed',
    'login',
    'spawn',
    'respawn',
    'game',
    'title',
    'rain',
    'time',
    'kicked',
    'end',
    'spawnReset',
    'death',
    'health',
    'breath',
    'entitySwingArm',
    'entityHurt',
    'entityDead',
    'entityTaming',
    'entityTamed',
    'entityShakingOffWater',
    'entityEatingGrass',
    'entityHandSwap',
    'entityWake',
    'entityEat',
    'entityCriticalEffect',
    'entityMagicCriticalEffect',
    'entityCrouch',
    'entityUncrouch',
    'entityEquip',
    'entitySleep',
    'entitySpawn',
    'entityElytraFlew',
    'usedFirework',
    'itemDrop',
    'playerCollect',
    'entityAttributes',
    'entityGone',
    'entityMoved',
    'entityDetach',
    'entityAttach',
    'entityUpdate',
    'entityEffect',
    'entityEffectEnd',
    'playerJoined',
    'playerUpdated',
    'playerLeft',
    'blockUpdate',
    'chunkColumnLoad',
    'chunkColumnUnload',
    'soundEffectHeard',
    'hardcodedSoundEffectHeard',
    'noteHeard',
    'pistonMove',
    'chestLidMove',
    'blockBreakProgressObserved',
    'blockBreakProgressEnd',
    'diggingCompleted',
    'diggingAborted',
    'move',
    'forcedMove',
    'mount',
    'dismount',
    'windowOpen',
    'windowClose',
    'sleep',
    'wake',
    'experience',
    'physicsTick',
    'scoreboardCreated',
    'scoreboardDeleted',
    'scoreboardTitleChanged',
    'scoreUpdated',
    'scoreRemoved',
    'scoreboardPosition',
    'teamCreated',
    'teamRemoved',
    'teamUpdated',
    'teamMemberAdded',
    'teamMemberRemoved',
    'bossBarCreated',
    'bossBarDeleted',
    'bossBarUpdated',
    'resourcePack',
    'heldItemChanged',
    'particle',
    'messagestr',
    'unmatchedMessage',
    'error'
  ]

  for (const nombre of eventos) {
    bot.on(nombre, (...args) => {
      contexto.contadorEvento()

      if (nombre === 'messagestr') return
      if (nombre === 'physicsTick') return
      if (nombre === 'move') return

      if (nombre === 'error') {
        const err = args[0]
        contexto.contadorError()
        logger?.error('eventos', `Evento error (${contexto.id})`, err?.message)
        return
      }

      if (nombre === 'kicked') {
        logger?.warn('eventos', `Evento kicked (${contexto.id})`, args[0])
        return
      }

      if (nombre === 'end') {
        logger?.warn('eventos', `Evento end (${contexto.id})`, args[0])
        return
      }

      logger?.debug('eventos', `Evento ${nombre} (${contexto.id})`)
    })
  }
}

module.exports = {
  registrarEventosMineflayer
}
