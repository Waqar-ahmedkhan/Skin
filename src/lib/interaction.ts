export const interaction = {
  /** extra Y rotation added by dragging, in radians */
  rotation: 0,
  /** last drag distance, used to cancel accidental clicks */
  dragDistance: 0,
}

export function resetInteraction() {
  interaction.rotation = 0
}
