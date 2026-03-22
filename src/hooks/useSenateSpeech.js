import { useState, useCallback } from 'react';
import { useDebateDispatch, useDebate } from '../context/DebateContext';

/**
 * Custom hook that handles all API interactions for the Senate speech system.
 * Manages speaking, requesting the floor, challenging, and striking from record.
 */
export function useSenateSpeech() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDebateDispatch();
  const state = useDebate();

  /**
   * Request a senator to speak (they raise their hand).
   * Calls the backend to generate a request-to-speak line.
   */
  const requestToSpeak = useCallback(async (senator) => {
    try {
      const recentSpeeches = state.transcript
        .filter(t => t.type === 'statement')
        .slice(-4);

      const res = await fetch('/api/request-to-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senator: {
            id: senator.id,
            name: senator.modelName,
            modelId: senator.modelId,
            side: senator.role, // 'for' or 'against'
          },
          motion: state.motion,
          previousSpeeches: recentSpeeches,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to request to speak');
      }

      const data = await res.json();

      dispatch({
        type: 'REQUEST_TO_SPEAK',
        payload: {
          senatorId: senator.id,
          senatorName: senator.modelName,
          side: senator.role,
          request: data.request,
          icon: senator.icon,
          modelId: senator.modelId,
        },
      });

      return data;
    } catch (err) {
      setError(err.message);
      console.error('requestToSpeak error:', err);
      return null;
    }
  }, [state.transcript, state.motion, dispatch]);

  /**
   * Grant the floor to a senator — generate and deliver their speech.
   */
  const grantFloor = useCallback(async (speakRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Mark as speaking/loading
      dispatch({ type: 'GRANT_FLOOR', payload: speakRequest.senatorId });

      // Determine if this speech should occasionally be unparliamentary (20% chance)
      const shouldBeUnparliamentary = Math.random() < 0.20;

      const recentContext = state.transcript
        .filter(t => t.type === 'statement' || t.type === 'system')
        .slice(-6);

      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senator: {
            id: speakRequest.senatorId,
            name: speakRequest.senatorName,
            modelId: speakRequest.modelId,
            role: speakRequest.side === 'for' ? 'Senator (FOR)' : 'Senator (AGAINST)',
            side: speakRequest.side,
          },
          motion: state.motion,
          context: recentContext,
          shouldBeUnparliamentary,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate speech');
      }

      const data = await res.json();

      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: speakRequest.senatorId,
          speakerName: speakRequest.senatorName,
          role: speakRequest.side,
          text: data.speech,
          type: 'statement',
        },
      });

      // Clear speaking state after a moment
      setTimeout(() => {
        dispatch({ type: 'SET_SPEAKING', payload: null });
      }, 2000);

      return data;
    } catch (err) {
      setError(err.message);
      console.error('grantFloor error:', err);
      dispatch({ type: 'SET_SPEAKING', payload: null });
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.transcript, state.motion, dispatch]);

  /**
   * Deny a senator the floor.
   */
  const denyFloor = useCallback((senatorId) => {
    dispatch({ type: 'DENY_FLOOR', payload: senatorId });
    dispatch({
      type: 'ADD_TRANSCRIPT',
      payload: {
        speakerId: 'president',
        speakerName: 'Mr. Speaker',
        role: 'president',
        text: 'The request is denied. The honourable member will resume their seat.',
        type: 'system',
      },
    });
  }, [dispatch]);

  /**
   * Challenge a transcript entry for unparliamentary language.
   * A random *other* senator raises the point of order.
   */
  const challengeSpeech = useCallback(async (transcriptEntry) => {
    setLoading(true);
    setError(null);

    try {
      // Pick a random senator from the opposite side to object
      const opposingSide = transcriptEntry.role === 'for' ? 'against' : 'for';
      const potentialObjectors = state.participants.filter(
        p => p.role === opposingSide && p.status !== 'removed' && p.id !== transcriptEntry.speakerId
      );

      if (potentialObjectors.length === 0) {
        throw new Error('No senators available to raise objection');
      }

      const objector = potentialObjectors[Math.floor(Math.random() * potentialObjectors.length)];

      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objector: {
            id: objector.id,
            name: objector.modelName,
            modelId: objector.modelId,
          },
          challengedSpeech: transcriptEntry.text,
          challengedSenatorName: transcriptEntry.speakerName,
          transcriptEntryId: transcriptEntry.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to process challenge');
      }

      const data = await res.json();

      // Add the point of order to the transcript
      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: objector.id,
          speakerName: objector.modelName,
          role: objector.role,
          text: data.pointOfOrder,
          type: 'point_of_order',
        },
      });

      // Add the challenge to the active challenges list
      dispatch({
        type: 'RAISE_POINT_OF_ORDER',
        payload: {
          id: Date.now(),
          transcriptEntryId: transcriptEntry.id,
          challengedSpeech: transcriptEntry.text,
          challengedSenatorName: transcriptEntry.speakerName,
          objectorName: objector.modelName,
          analysis: data.analysis,
          pointOfOrder: data.pointOfOrder,
        },
      });

      return data;
    } catch (err) {
      setError(err.message);
      console.error('challengeSpeech error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.participants, dispatch]);

  /**
   * Strike a transcript entry from the record (Speaker's decision).
   */
  const strikeFromRecord = useCallback(async (challengeId, transcriptEntryId) => {
    try {
      const res = await fetch('/api/strike-from-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptEntryId,
          reason: 'Unparliamentary language — stricken by order of the Speaker.',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to strike from record');
      }

      dispatch({ type: 'STRIKE_FROM_RECORD', payload: { transcriptEntryId } });
      dispatch({ type: 'DISMISS_CHALLENGE', payload: challengeId });

      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: 'president',
          speakerName: 'Mr. Speaker',
          role: 'president',
          text: 'The offending remarks shall be stricken from the record. The honourable member is cautioned to use parliamentary language.',
          type: 'system',
        },
      });
    } catch (err) {
      setError(err.message);
      console.error('strikeFromRecord error:', err);
    }
  }, [dispatch]);

  /**
   * Dismiss a challenge — the Speaker overrules the objection.
   */
  const dismissChallenge = useCallback((challengeId) => {
    dispatch({ type: 'DISMISS_CHALLENGE', payload: challengeId });
    dispatch({
      type: 'ADD_TRANSCRIPT',
      payload: {
        speakerId: 'president',
        speakerName: 'Mr. Speaker',
        role: 'president',
        text: 'The point of order is not well taken. The remarks shall stand. Proceedings will continue.',
        type: 'system',
      },
    });
  }, [dispatch]);

  /**
   * Trigger multiple senators to randomly request to speak.
   */
  const triggerSpeakRequests = useCallback(async (count = 3) => {
    const eligible = state.participants.filter(
      p => p.status !== 'removed' && p.role !== 'judge' &&
        !state.speakRequests?.some(r => r.senatorId === p.id)
    );

    if (eligible.length === 0) return;

    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, eligible.length));

    for (const senator of selected) {
      await requestToSpeak(senator);
    }
  }, [state.participants, state.speakRequests, requestToSpeak]);

  return {
    loading,
    error,
    requestToSpeak,
    grantFloor,
    denyFloor,
    challengeSpeech,
    strikeFromRecord,
    dismissChallenge,
    triggerSpeakRequests,
  };
}
