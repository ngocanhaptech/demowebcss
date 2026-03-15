import { faCalendarAlt, faSmile } from '@fortawesome/free-regular-svg-icons'
import { faDollarSign, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { updateGoal as updateGoalApi } from '../../../api/lib'
import { Goal } from '../../../api/types'
import { selectGoalsMap, updateGoal as updateGoalRedux } from '../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import DatePicker from '../../components/DatePicker'
import { Theme } from '../../components/Theme'
import EmojiPicker from '../../components/EmojiPicker' // Đảm bảo import này tồn tại

type Props = { goal: Goal }

export function GoalManager(props: Props) {
  const dispatch = useAppDispatch()
  
  // 1. Chỉ khai báo goal một lần duy nhất
  const goal = useAppSelector(selectGoalsMap)[props.goal.id]

  // 2. Khai báo state (không trùng lặp)
  const [name, setName] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [targetAmount, setTargetAmount] = useState<number | null>(null)
  const [icon, setIcon] = useState<string | null>(null)
  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false)

  // 3. Đồng bộ state khi component mount hoặc props thay đổi
  useEffect(() => {
    setName(props.goal.name)
    setTargetDate(props.goal.targetDate)
    setTargetAmount(props.goal.targetAmount)
    setIcon(props.goal.icon ?? null)
  }, [props.goal])

  const hasIcon = () => icon != null

  // 4. Hàm helper để tránh lặp code khi cập nhật dữ liệu
  const persistUpdate = (updatedFields: Partial<Goal>) => {
    const updatedGoal: Goal = {
      ...props.goal,
      name: name ?? props.goal.name,
      targetDate: targetDate ?? props.goal.targetDate,
      targetAmount: targetAmount ?? props.goal.targetAmount,
      icon: icon ?? (props.goal.icon || undefined),
      ...updatedFields,
    }
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const updateNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
    persistUpdate({ name: event.target.value })
  }

  const updateTargetAmountOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(event.target.value)
    setTargetAmount(val)
    persistUpdate({ targetAmount: val })
  }

  const pickDateOnChange = (date: MaterialUiPickersDate) => {
    if (date) {
      setTargetDate(date)
      persistUpdate({ targetDate: date })
    }
  }

  return (
    <ContainerWrapper>
      <GoalManagerContainer>
        {/* Nút bấm để mở Emoji Picker */}
        <IconSection onClick={(e) => { e.stopPropagation(); setEmojiPickerIsOpen(true); }}>
          {hasIcon() ? <SelectedIcon>{icon}</SelectedIcon> : <FontAwesomeIcon icon={faSmile} size="3x" color="#aeaeae" />}
        </IconSection>

        <NameInput value={name ?? ''} onChange={updateNameOnChange} placeholder="Goal Name" />

        <Group>
          <Field name="Target Date" icon={faCalendarAlt} />
          <Value><DatePicker value={targetDate} onChange={pickDateOnChange} /></Value>
        </Group>

        <Group>
          <Field name="Target Amount" icon={faDollarSign} />
          <Value><StringInput value={targetAmount ?? ''} onChange={updateTargetAmountOnChange} /></Value>
        </Group>

        <Group>
          <Field name="Balance" icon={faDollarSign} />
          <Value><StringValue>{props.goal.balance}</StringValue></Value>
        </Group>
      </GoalManagerContainer>

      {/* 5. Emoji Picker Container */}
      {emojiPickerIsOpen && (
        <EmojiPickerContainer 
          isOpen={emojiPickerIsOpen} 
          hasIcon={hasIcon()}
          onClick={(e) => e.stopPropagation()}
        >
          <EmojiPicker onClick={(emoji: any, event: any) => {
             event.stopPropagation()
             setIcon(emoji.native)
             setEmojiPickerIsOpen(false)
             persistUpdate({ icon: emoji.native })
          }} />
        </EmojiPickerContainer>
      )}
    </ContainerWrapper>
  )
}

// --- Styled Components ---

const ContainerWrapper = styled.div`
  position: relative;
  width: 100%;
`

const IconSection = styled.div`
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 10px;
  width: fit-content;
  &:hover { background: rgba(0,0,0,0.05); border-radius: 8px; }
`

const SelectedIcon = styled.span`
  font-size: 3rem;
`

const EmojiPickerContainer = styled.div<{ isOpen: boolean; hasIcon: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  top: 5rem;
  left: 0;
  z-index: 1000;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
`

const GoalManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const Group = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
`

const Field = ({ name, icon }: { name: string; icon: any }) => (
  <FieldContainer>
    <FontAwesomeIcon icon={icon} size="lg" />
    <FieldName>{name}</FieldName>
  </FieldContainer>
)

const FieldContainer = styled.div`
  display: flex;
  align-items: center;
  width: 180px;
  color: #aeaeae;
`

const FieldName = styled.span`
  margin-left: 10px;
  font-size: 1.2rem;
`

const Value = styled.div`
  flex: 1;
`

const NameInput = styled.input`
  background: transparent;
  border: none;
  font-size: 3rem;
  font-weight: bold;
  color: ${props => props.theme.text};
  outline: none;
  margin-bottom: 2rem;
`

const StringInput = styled.input`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.text};
  outline: none;
  font-weight: bold;
`

const StringValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
`