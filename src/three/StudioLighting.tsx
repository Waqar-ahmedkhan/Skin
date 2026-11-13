import { Environment, Lightformer } from '@react-three/drei'

export function StudioLighting({ tint }: { tint: string }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3.2, 4.5, 5.2]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[4.5, 2.5, 3]} intensity={0.8} color="#fff7ec" />
      <directionalLight position={[-4.5, 2, -3.5]} intensity={0.35} color={tint} />

      <Environment resolution={128}>
        {/* Two vertical studio reflections keep the rounded packaging legible without a bright forehead patch. */}
        <Lightformer
          form="rect" intensity={2.3} position={[-3, 2.2, 4.5]}
          rotation={[0.2, 0.48, -0.28]} scale={[1.6, 6.5, 1]} color="#ffffff"
        />
        <Lightformer
          form="rect" intensity={1.1} position={[4.6, 0.6, 2.2]}
          rotation-y={-Math.PI / 2.2} scale={[1.4, 6, 1]} color="#fff3e6"
        />
      </Environment>
    </>
  )
}
