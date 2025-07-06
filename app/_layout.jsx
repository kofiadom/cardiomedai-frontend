import { Stack } from "expo-router";
import { BpReaderContext } from '../context/bpReadingsContext';
import { AverageBpContext } from '../context/averageReadings';
import { HealthAdvisorContext } from '../context/healthAdvisorContext';

export default function RootLayout() {
  return (
    <BpReaderContext>
      <AverageBpContext>
        <HealthAdvisorContext>
          <Stack screenOptions={{ headerShown: false }} />
        </HealthAdvisorContext>
      </AverageBpContext>
    </BpReaderContext>
  );
}
