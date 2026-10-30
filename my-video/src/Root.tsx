import { Composition } from "remotion";
import { MyComposition, TOTAL_DURATION } from "./Composition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="Sunscreen"
      component={MyComposition}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};