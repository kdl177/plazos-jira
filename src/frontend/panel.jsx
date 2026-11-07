import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box, Button, ButtonGroup, DatePicker, Form, FormFooter, FormSection, Inline, Label, Lozenge,
  SectionMessage, Select, Stack, Strong, Text, Textfield, Toggle, useForm,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const UNITS = [
  { label: 'Business days (días hábiles)', value: 'business' },
  { label: 'Calendar days (días naturales)', value: 'calendar' },
  { label: 'Months (meses)', value: 'months' },
];
const UNIT_LABEL = Object.fromEntries(UNITS.map((u) => [u.value, u.label]));
const APPEARANCE = { overdue: 'removed', today: 'removed', d1: 'removed', d3: 'moved', d7: 'inprogress', ok: 'success' };

const leftLabel = (r) =>
  r.level === 'overdue' ? `Overdue by ${-r.days} days` : r.days === 0 ? 'Expires today' : `${r.days} days left`;

const DeadlineForm = ({ onSubmit }) => {
  const { getFieldId, register, handleSubmit } = useForm();
  const submit = (data) => onSubmit({
    notified: data.notified, amount: Number(data.amount), unit: data.unit?.value ?? data.unit, urgent: !!data.urgent,
  });
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <FormSection>
        <Stack space="space.150">
          <Text>Counts from the day after notification under art. 183 LOPJ. Weekends, holidays, August and 24 Dec to 6 Jan are excluded.</Text>
          <Box>
            <Label labelFor={getFieldId('notified')}>Notification date</Label>
            <DatePicker {...register('notified', { required: true })} />
          </Box>
          <Inline space="space.150" shouldWrap>
            <Box>
              <Label labelFor={getFieldId('amount')}>Amount</Label>
              <Textfield type="number" {...register('amount', { required: true, min: 1 })} />
            </Box>
            <Box>
              <Label labelFor={getFieldId('unit')}>Unit</Label>
              <Select options={UNITS} {...register('unit', { required: true })} />
            </Box>
          </Inline>
          <Box>
            <Label labelFor={getFieldId('urgent')}>Urgent matter (August and Christmas count)</Label>
            <Toggle {...register('urgent')} />
          </Box>
        </Stack>
      </FormSection>
      <FormFooter>
        <Button type="submit" appearance="primary">Compute deadline</Button>
      </FormFooter>
    </Form>
  );
};

const DeadlineView = ({ rec, run }) => {
  const [due, setDue] = useState(rec.due);
  return (
    <Stack space="space.150">
      <Inline space="space.100" alignBlock="center" shouldWrap>
        <Text><Strong>{rec.due}</Strong></Text>
        <Lozenge appearance={APPEARANCE[rec.level]}>{leftLabel(rec)}</Lozenge>
        <Lozenge appearance={rec.confirmed ? 'success' : 'default'}>{rec.confirmed ? 'Confirmed' : 'Proposed'}</Lozenge>
      </Inline>
      <Text>
        {rec.amount} {UNIT_LABEL[rec.unit] ?? rec.unit} from {rec.notified}{rec.urgent ? ', urgent matter' : ''}.
        The Jira due date follows this deadline.{rec.edited ? ' Date set by the lawyer.' : ''}
      </Text>
      {!rec.confirmed && (
        <Box>
          <Label labelFor="due">Confirm the date, or correct it if the court says otherwise</Label>
          <DatePicker id="due" defaultValue={rec.due} onChange={(v) => setDue(v || rec.due)} />
        </Box>
      )}
      <ButtonGroup>
        {!rec.confirmed && <Button appearance="primary" onClick={() => run('confirmDeadline', { due })}>Confirm</Button>}
        <Button appearance="subtle" onClick={() => run('clearDeadline')}>Remove deadline</Button>
      </ButtonGroup>
    </Stack>
  );
};

const App = () => {
  const [rec, setRec] = useState(undefined);
  const [error, setError] = useState(null);
  const run = (name, payload) =>
    invoke(name, payload).then((r) => { setRec(r); setError(null); }).catch((e) => setError(e?.message ?? String(e)));
  useEffect(() => { run('getDeadline'); }, []);

  if (rec === undefined && !error) return <Text>Loading...</Text>;
  return (
    <Stack space="space.200">
      {error && <SectionMessage appearance="error"><Text>{error}</Text></SectionMessage>}
      {rec ? <DeadlineView rec={rec} run={run} /> : <DeadlineForm onSubmit={(d) => run('setDeadline', d)} />}
    </Stack>
  );
};

ForgeReconciler.render(<React.StrictMode><App /></React.StrictMode>);
