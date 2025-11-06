import fuzz from "fuzzball";
import { fishbowlService } from "../services/fishbowl.service";

export async function fuzzyMatchInputToPartNum(input: string) {
  const inputnormalized = input.toUpperCase();
  const partnums = await fishbowlService.getAllActivePartNums();
  let res: [number, string][] = [];
  for (const partnum of partnums) {
    const score = fuzz.ratio(inputnormalized, partnum);
    res.push([score, partnum]);
  }
  res.sort((a, b) => b[0] - a[0]);
  const top5 = res.slice(0, 5);
  console.log(top5);
  return top5;
}
