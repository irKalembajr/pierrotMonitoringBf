type StatePayload = {
  relay1: boolean;
  relay2: boolean;
  switch: boolean;
  source?: string;
  at: string; // ISO date
};

type Command = {
  relay1?: boolean;
  relay2?: boolean;
  at: string;
};

// WARNING: This is an in-memory store. On serverless it may reset between cold starts.
// For production, plug a durable store (Vercel KV, Upstash, Supabase, etc.).
const current: { state: StatePayload | null, lastCommand: Command | null } = {
  state: null,
  lastCommand: null
};

export function setState(update: Omit<StatePayload, "at">) {
  current.state = { ...update, at: new Date().toISOString() };
  return current.state;
}

export function getState() {
  return current.state;
}

export function setCommand(cmd: Omit<Command, "at">) {
  current.lastCommand = { ...cmd, at: new Date().toISOString() };
  return current.lastCommand;
}

export function popCommand() {
  const cmd = current.lastCommand;
  current.lastCommand = null;
  return cmd;
}

export function peekCommand() {
  return current.lastCommand;
}
