import { createContext, useContext, useReducer } from 'react';

const DebateContext = createContext(null);
const DebateDispatchContext = createContext(null);

// Session phases
export const PHASES = {
  MODEL_SELECTION: 'MODEL_SELECTION',
  DEBATE_ACTIVE: 'DEBATE_ACTIVE',
  PAUSED: 'PAUSED',
  DELIBERATION: 'DELIBERATION',
  VERDICT: 'VERDICT',
  IMPEACHMENT: 'IMPEACHMENT',
};

const initialState = {
  phase: PHASES.MODEL_SELECTION,
  motion: '',
  round: 0,
  totalRounds: 5,

  // Participants: { id, modelId, modelName, icon, provider, role, status }
  // role: 'for' | 'against' | 'judge' | 'spare'
  // status: 'active' | 'speaking' | 'removed' | 'substituted' | 'idle' | 'loading'
  participants: [],
  spares: [],

  // Transcript entries: { id, speakerId, speakerName, role, text, timestamp, type, stricken }
  // type: 'statement' | 'objection' | 'point_of_order' | 'bribe_attempt' | 'system'
  transcript: [],

  // Who is currently speaking
  activeSpeaker: null,

  // Queue of senators requesting to speak
  // { senatorId, senatorName, side, request, icon, modelId }
  speakRequests: [],

  // Active challenges (unparliamentary language)
  // { id, transcriptEntryId, challengedSpeech, challengedSenatorName, objectorName, analysis, pointOfOrder }
  activeChallenges: [],

  // Verdict
  verdict: null,
  presidentialVerdict: null, // can differ from judges' verdict

  // Impeachment
  impeachmentActive: false,
  impeachmentRound: 0,
  impeachmentVotes: { for: 0, against: 0 },

  // Pause/removal
  pauseReason: null,
  removalRequest: null,
};

function debateReducer(state, action) {
  switch (action.type) {
    case 'SET_MOTION':
      return { ...state, motion: action.payload };

    case 'START_SESSION': {
      const { participants, spares } = action.payload;
      return {
        ...state,
        phase: PHASES.DEBATE_ACTIVE,
        participants,
        spares,
        round: 1,
        speakRequests: [],
        activeChallenges: [],
        transcript: [{
          id: Date.now(),
          speakerId: 'system',
          speakerName: 'System',
          role: 'system',
          text: `Session commenced. Motion: "${state.motion}"`,
          timestamp: new Date().toISOString(),
          type: 'system',
          stricken: false,
        }],
      };
    }

    case 'ADD_TRANSCRIPT': {
      return {
        ...state,
        transcript: [...state.transcript, {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          stricken: false,
          ...action.payload,
        }],
      };
    }

    case 'SET_SPEAKING':
      return {
        ...state,
        activeSpeaker: action.payload,
        participants: state.participants.map(p => ({
          ...p,
          status: p.id === action.payload ? 'speaking' : (p.status === 'speaking' || p.status === 'loading' ? 'active' : p.status),
        })),
      };

    // ─── New: Request to speak ───────────────────
    case 'REQUEST_TO_SPEAK': {
      // Don't allow duplicate requests
      if (state.speakRequests.some(r => r.senatorId === action.payload.senatorId)) {
        return state;
      }
      return {
        ...state,
        speakRequests: [...state.speakRequests, action.payload],
      };
    }

    // ─── New: Grant floor ────────────────────────
    case 'GRANT_FLOOR': {
      const senatorId = action.payload;
      return {
        ...state,
        activeSpeaker: senatorId,
        speakRequests: state.speakRequests.filter(r => r.senatorId !== senatorId),
        participants: state.participants.map(p => ({
          ...p,
          status: p.id === senatorId ? 'loading' : (p.status === 'speaking' ? 'active' : p.status),
        })),
      };
    }

    // ─── New: Deny floor ─────────────────────────
    case 'DENY_FLOOR': {
      return {
        ...state,
        speakRequests: state.speakRequests.filter(r => r.senatorId !== action.payload),
      };
    }

    // ─── New: Raise point of order ───────────────
    case 'RAISE_POINT_OF_ORDER': {
      return {
        ...state,
        activeChallenges: [...state.activeChallenges, action.payload],
      };
    }

    // ─── New: Strike from record ─────────────────
    case 'STRIKE_FROM_RECORD': {
      const { transcriptEntryId } = action.payload;
      return {
        ...state,
        transcript: state.transcript.map(entry =>
          entry.id === transcriptEntryId ? { ...entry, stricken: true } : entry
        ),
      };
    }

    // ─── New: Dismiss challenge ──────────────────
    case 'DISMISS_CHALLENGE': {
      return {
        ...state,
        activeChallenges: state.activeChallenges.filter(c => c.id !== action.payload),
      };
    }

    case 'NEXT_ROUND':
      return {
        ...state,
        round: state.round + 1,
        activeSpeaker: null,
        speakRequests: [],
        participants: state.participants.map(p => ({
          ...p,
          status: p.status === 'speaking' ? 'active' : p.status,
        })),
      };

    case 'PAUSE_SESSION':
      return {
        ...state,
        phase: PHASES.PAUSED,
        pauseReason: action.payload,
      };

    case 'RESUME_SESSION':
      return {
        ...state,
        phase: PHASES.DEBATE_ACTIVE,
        pauseReason: null,
      };

    case 'REMOVE_PARTICIPANT': {
      const removedId = action.payload;
      const removed = state.participants.find(p => p.id === removedId);
      if (!removed || state.spares.length === 0) return state;

      const replacement = state.spares[0];
      const newParticipant = {
        ...replacement,
        role: removed.role,
        status: 'active',
      };

      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === removedId ? newParticipant : p
        ),
        spares: state.spares.slice(1),
        transcript: [...state.transcript, {
          id: Date.now(),
          speakerId: 'system',
          speakerName: 'System',
          role: 'system',
          text: `${removed.modelName} has been removed. ${replacement.modelName} takes their place as ${removed.role.toUpperCase()}.`,
          timestamp: new Date().toISOString(),
          type: 'system',
          stricken: false,
        }],
      };
    }

    case 'START_DELIBERATION':
      return {
        ...state,
        phase: PHASES.DELIBERATION,
        activeSpeaker: null,
      };

    case 'SET_VERDICT':
      return {
        ...state,
        verdict: action.payload,
      };

    case 'PRESENT_VERDICT':
      return {
        ...state,
        phase: PHASES.VERDICT,
        presidentialVerdict: action.payload,
      };

    case 'START_IMPEACHMENT':
      return {
        ...state,
        phase: PHASES.IMPEACHMENT,
        impeachmentActive: true,
        impeachmentRound: 1,
        impeachmentVotes: { for: 0, against: 0 },
      };

    case 'IMPEACHMENT_VOTE':
      return {
        ...state,
        impeachmentVotes: {
          for: state.impeachmentVotes.for + (action.payload === 'for' ? 1 : 0),
          against: state.impeachmentVotes.against + (action.payload === 'against' ? 1 : 0),
        },
      };

    case 'NEXT_IMPEACHMENT_ROUND':
      return {
        ...state,
        impeachmentRound: state.impeachmentRound + 1,
      };

    case 'END_IMPEACHMENT':
      return {
        ...state,
        impeachmentActive: false,
        phase: PHASES.VERDICT,
        presidentialVerdict: action.payload.overturned ? state.verdict : state.presidentialVerdict,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function DebateProvider({ children }) {
  const [state, dispatch] = useReducer(debateReducer, initialState);

  return (
    <DebateContext.Provider value={state}>
      <DebateDispatchContext.Provider value={dispatch}>
        {children}
      </DebateDispatchContext.Provider>
    </DebateContext.Provider>
  );
}

export function useDebate() {
  return useContext(DebateContext);
}

export function useDebateDispatch() {
  return useContext(DebateDispatchContext);
}
