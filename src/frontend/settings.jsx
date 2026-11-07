import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box, Button, DatePicker, Heading, Inline, Label, SectionMessage, Stack, Text, Textfield,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [list, setList] = useState(undefined);
  const [error, setError] = useState(null);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');

  const save = (holidays) =>
    invoke('setHolidays', { holidays }).then((l) => { setList(l); setError(null); }).catch((e) => setError(e?.message ?? String(e)));
  useEffect(() => { invoke('getHolidays').then(setList).catch((e) => setError(String(e))); }, []);

  const add = () => {
    if (!date) return;
    save([...(list ?? []), { date, name }]);
    setDate(''); setName('');
  };

  return (
    <Stack space="space.200">
      <Heading size="medium">Court holidays for this project</Heading>
      <Text>
        National holidays and Good Friday are built in. Add the regional and local ones here, for example
        Andalusia Day (28 Feb) or the local patron saint. Proposed deadlines are recomputed when this list
        changes; confirmed deadlines never move on their own.
      </Text>
      {error && <SectionMessage appearance="error"><Text>{error}</Text></SectionMessage>}
      {list === undefined ? <Text>Loading...</Text> : list.length === 0 ? <Text>No extra holidays yet.</Text> : (
        <Stack space="space.050">
          {list.map((h) => (
            <Inline key={h.date} space="space.150" alignBlock="center">
              <Text>{h.date}</Text>
              <Text>{h.name || '(no name)'}</Text>
              <Button appearance="subtle" onClick={() => save(list.filter((x) => x.date !== h.date))}>Remove</Button>
            </Inline>
          ))}
        </Stack>
      )}
      <Inline space="space.150" alignBlock="end" shouldWrap>
        <Box>
          <Label labelFor="date">Date</Label>
          <DatePicker id="date" value={date} onChange={(v) => setDate(v || '')} />
        </Box>
        <Box>
          <Label labelFor="name">Name</Label>
          <Textfield id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Día de Andalucía" />
        </Box>
        <Button appearance="primary" onClick={add} isDisabled={!date}>Add holiday</Button>
      </Inline>
    </Stack>
  );
};

ForgeReconciler.render(<React.StrictMode><App /></React.StrictMode>);
