'use client';

// キャラクターシート状態管理フック
// useReducer で全状態を一元管理し、各コンポーネントから dispatch で更新

import { useReducer, useCallback } from 'react';
import { INITIAL_STATE, STARTING_CP, EQUIPMENT, EQUIPMENT_OPTIONS, GIFTS } from '../data/masterData';

// アクション種別
const ACTIONS = {
    SET_FIELD: 'SET_FIELD',
    SET_ABILITY: 'SET_ABILITY',
    SET_EMOTION: 'SET_EMOTION',
    SET_EROSION: 'SET_EROSION',
    ADD_EQUIPMENT: 'ADD_EQUIPMENT',
    REMOVE_EQUIPMENT: 'REMOVE_EQUIPMENT',
    TOGGLE_GIFT: 'TOGGLE_GIFT',
    ADD_ROLL: 'ADD_ROLL',
    LOAD_STATE: 'LOAD_STATE',
    RESET: 'RESET',
};

function characterReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_FIELD:
            return { ...state, [action.field]: action.value };

        case ACTIONS.SET_ABILITY:
            return {
                ...state,
                abilities: { ...state.abilities, [action.abilityId]: action.rank },
            };

        case ACTIONS.SET_EMOTION:
            return {
                ...state,
                emotions: {
                    ...state.emotions,
                    [action.emotionId]: Math.max(0, Math.min(10, action.value)),
                },
            };

        case ACTIONS.SET_EROSION:
            return { ...state, erosion: Math.max(0, Math.min(100, action.value)) };

        case ACTIONS.ADD_EQUIPMENT:
            return {
                ...state,
                equipped: [...state.equipped, { equipId: action.equipId, optionIds: action.optionIds || [] }],
            };

        case ACTIONS.REMOVE_EQUIPMENT:
            return {
                ...state,
                equipped: state.equipped.filter((_, i) => i !== action.index),
            };

        case ACTIONS.TOGGLE_GIFT:
            return {
                ...state,
                selectedGifts: state.selectedGifts.includes(action.giftId)
                    ? state.selectedGifts.filter(id => id !== action.giftId)
                    : [...state.selectedGifts, action.giftId],
            };

        case ACTIONS.ADD_ROLL:
            return {
                ...state,
                rollHistory: [action.roll, ...state.rollHistory].slice(0, 50),
            };

        case ACTIONS.LOAD_STATE:
            return { ...INITIAL_STATE, ...action.state };

        case ACTIONS.RESET:
            return { ...INITIAL_STATE };

        default:
            return state;
    }
}

// CP消費量を計算
function calcUsedCP(state) {
    let cp = 0;
    // 装備のCP
    for (const eq of state.equipped) {
        const item = EQUIPMENT.find(e => e.id === eq.equipId);
        if (item) cp += item.cp;
        for (const optId of eq.optionIds) {
            const opt = EQUIPMENT_OPTIONS.find(o => o.id === optId);
            if (opt) cp += opt.cp;
        }
    }
    // ギフトのCP
    for (const giftId of state.selectedGifts) {
        const gift = GIFTS.find(g => g.id === giftId);
        if (gift) cp += gift.cp;
    }
    return cp;
}

export function useCharacterState(initialState = null) {
    const [state, dispatch] = useReducer(
        characterReducer,
        initialState || INITIAL_STATE
    );

    // 便利メソッド群
    const setField = useCallback((field, value) => {
        dispatch({ type: ACTIONS.SET_FIELD, field, value });
    }, []);

    const setAbility = useCallback((abilityId, rank) => {
        dispatch({ type: ACTIONS.SET_ABILITY, abilityId, rank });
    }, []);

    const setEmotion = useCallback((emotionId, value) => {
        dispatch({ type: ACTIONS.SET_EMOTION, emotionId, value });
    }, []);

    const setErosion = useCallback((value) => {
        dispatch({ type: ACTIONS.SET_EROSION, value });
    }, []);

    const addEquipment = useCallback((equipId, optionIds = []) => {
        dispatch({ type: ACTIONS.ADD_EQUIPMENT, equipId, optionIds });
    }, []);

    const removeEquipment = useCallback((index) => {
        dispatch({ type: ACTIONS.REMOVE_EQUIPMENT, index });
    }, []);

    const toggleGift = useCallback((giftId) => {
        dispatch({ type: ACTIONS.TOGGLE_GIFT, giftId });
    }, []);

    const addRoll = useCallback((roll) => {
        dispatch({ type: ACTIONS.ADD_ROLL, roll });
    }, []);

    const loadState = useCallback((savedState) => {
        dispatch({ type: ACTIONS.LOAD_STATE, state: savedState });
    }, []);

    const resetState = useCallback(() => {
        dispatch({ type: ACTIONS.RESET });
    }, []);

    // CP計算
    const usedCP = calcUsedCP(state);
    const remainingCP = STARTING_CP - usedCP;

    return {
        state,
        dispatch,
        // セッター
        setField,
        setAbility,
        setEmotion,
        setErosion,
        addEquipment,
        removeEquipment,
        toggleGift,
        addRoll,
        loadState,
        resetState,
        // 計算値
        usedCP,
        remainingCP,
    };
}
