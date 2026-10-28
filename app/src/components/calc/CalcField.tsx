import BlankField from './BlankField.tsx'
import ChoiceField from './ChoiceField.tsx'
import { isChoice, type FieldInfo } from './FieldInfo.ts'
import SliderField from './SliderField.tsx'

/** One calculator input: chips for choices, a slider once there is a figure, else a blank box. */
export default function CalcField({ info }: { info: FieldInfo }) {
  if (isChoice(info.input.unit)) return <ChoiceField info={info} />
  if (info.value == null) return <BlankField info={info} />
  return <SliderField info={info} />
}
