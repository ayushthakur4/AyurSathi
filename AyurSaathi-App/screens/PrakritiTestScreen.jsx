import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const QUESTIONS = [
    {
        id: 'body_frame',
        question: 'How would you describe your body frame?',
        options: [
            { text: 'Thin, bony, prominent joints', type: 'V' },
            { text: 'Medium build, good muscle tone', type: 'P' },
            { text: 'Large build, thick, sturdy', type: 'K' },
        ]
    },
    {
        id: 'skin',
        question: 'What is your skin type like?',
        options: [
            { text: 'Dry, rough, cold to touch', type: 'V' },
            { text: 'Soft, oily, warm, sensitive', type: 'P' },
            { text: 'Thick, oily, cool, smooth', type: 'K' },
        ]
    },
    {
        id: 'appetite',
        question: 'How is your appetite usually?',
        options: [
            { text: 'Irregular, sometimes skip meals', type: 'V' },
            { text: 'Strong, unbearable if hungry', type: 'P' },
            { text: 'Slow but steady, can skip meals easily', type: 'K' },
        ]
    },
    {
        id: 'sleep',
        question: 'Describe your sleep pattern.',
        options: [
            { text: 'Light, interrupted, often wake up', type: 'V' },
            { text: 'Moderate, sound sleep', type: 'P' },
            { text: 'Heavy, deep, hard to wake up', type: 'K' },
        ]
    },
    {
        id: 'temperament',
        question: 'How do you react to stress?',
        options: [
            { text: 'Anxious, fearful, worry a lot', type: 'V' },
            { text: 'Irritable, angry, impatient', type: 'P' },
            { text: 'Calm, withdrawn, slow to react', type: 'K' },
        ]
    },
    {
        id: 'weather',
        question: 'Which weather do you dislike the most?',
        options: [
            { text: 'Cold and dry weather', type: 'V' },
            { text: 'Hot and humid weather', type: 'P' },
            { text: 'Cold and damp weather', type: 'K' },
        ]
    }
];

const RESULTS = {
    V: {
        name: 'Vata',
        element: 'Air + Space',
        traits: ['Creative', 'Energetic', 'Quick learner', 'Changeable'],
        tips: [
            'Need routine and stability.',
            'Eat warm, cooked, grounding foods.',
            'Massage with warm sesame oil daily.',
            'Favor sweet, sour, and salty tastes.'
        ],
        color: ['#5AC8FA', '#007AFF']
    },
    P: {
        name: 'Pitta',
        element: 'Fire + Water',
        traits: ['Intelligent', 'Clean', 'Focused', 'Determined'],
        tips: [
            'Avoid overheating and spicy foods.',
            'Eat cooling foods like cucumber and mint.',
            'Spend time in nature and moonlight.',
            'Favor sweet, bitter, and astringent tastes.'
        ],
        color: ['#FF9500', '#FF3B30']
    },
    K: {
        name: 'Kapha',
        element: 'Earth + Water',
        traits: ['Calm', 'Loyal', 'Forgiving', 'Strong'],
        tips: [
            'Need stimulation and exercise.',
            'Eat light, dry, and warm foods.',
            'Wake up early before sunrise.',
            'Favor pungent, bitter, and astringent tastes.'
        ],
        color: ['#34C759', '#00C7BE']
    }
};

export default function PrakritiTestScreen({ navigation }) {
    const { theme } = useTheme();
    const s = useMemo(() => mk(theme), [theme]);

    const [currentQ, setCurrentQ] = useState(0);
    const [scores, setScores] = useState({ V: 0, P: 0, K: 0 });
    const [finished, setFinished] = useState(false);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const handleAnswer = (type) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Update score
        const newScores = { ...scores, [type]: scores[type] + 1 };
        setScores(newScores);

        // Animate transition
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(progressAnim, {
                toValue: (currentQ + 1) / QUESTIONS.length,
                duration: 300,
                useNativeDriver: false
            })
        ]).start(() => {
            if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(currentQ + 1);
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
            } else {
                setFinished(true);
            }
        });
    };

    const getDominantDosha = () => {
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const winner = sorted[0][0];
        return RESULTS[winner];
    };

    const restart = () => {
        setScores({ V: 0, P: 0, K: 0 });
        setCurrentQ(0);
        setFinished(false);
        progressAnim.setValue(0);
        fadeAnim.setValue(1);
    };

    if (finished) {
        const result = getDominantDosha();
        return (
            <View style={s.root}>
                <ScrollView contentContainerStyle={s.resultScroll} showsVerticalScrollIndicator={false}>
                    <LinearGradient colors={result.color} style={s.resultHeader}>
                        <View style={s.navBar}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={s.resultCircle}>
                            <Text style={s.resultInitial}>{result.name.charAt(0)}</Text>
                        </View>
                        <Text style={s.resultTitle}>You are {result.name}</Text>
                        <Text style={s.resultSub}>{result.element} Dominant</Text>
                    </LinearGradient>

                    <View style={s.resultBody}>
                        <View style={s.section}>
                            <Text style={s.sectionTitle}>Your Traits</Text>
                            <View style={s.tagsRow}>
                                {result.traits.map((trait, i) => (
                                    <View key={i} style={s.tag}>
                                        <Text style={s.tagText}>{trait}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={s.section}>
                            <Text style={s.sectionTitle}>Lifestyle Tips</Text>
                            {result.tips.map((tip, i) => (
                                <View key={i} style={s.tipRow}>
                                    <Ionicons name="checkmark-circle" size={20} color={result.color[0]} />
                                    <Text style={s.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity style={[s.btn, { backgroundColor: result.color[0] }]} onPress={restart}>
                            <Text style={s.btnText}>Retake Test</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.secBtn} onPress={() => navigation.navigate('Home')}>
                            <Text style={[s.secBtnText, { color: result.color[0] }]}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtnIcon}>
                    <Ionicons name="chevron-back" size={24} color={theme.text.header} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Prakriti Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Bar */}
            <View style={s.progressTrack}>
                <Animated.View style={[s.progressBar, {
                    width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                    })
                }]} />
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                    <Text style={s.qStep}>Question {currentQ + 1} of {QUESTIONS.length}</Text>
                    <Text style={s.question}>{QUESTIONS[currentQ].question}</Text>

                    <View style={s.options}>
                        {QUESTIONS[currentQ].options.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={s.optionCard}
                                onPress={() => handleAnswer(opt.type)}
                                activeOpacity={0.7}
                            >
                                <View style={s.optionCircle}>
                                    <Text style={s.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                                </View>
                                <Text style={s.optionText}>{opt.text}</Text>
                                <Ionicons name="chevron-forward" size={20} color={theme.text.subtext} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const mk = (t) => StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background.primary },
    scroll: { padding: 24, flexGrow: 1 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 16, paddingBottom: 16,
        backgroundColor: t.background.primary,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: t.text.header },
    backBtnIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    progressTrack: { height: 4, backgroundColor: t.separator, marginHorizontal: 24, borderRadius: 2, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: t.primary, borderRadius: 2 },

    qStep: { fontSize: 13, color: t.primary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 12, marginTop: 20 },
    question: { fontSize: 28, fontWeight: '800', color: t.text.header, lineHeight: 36, marginBottom: 40 },

    options: { gap: 16 },
    optionCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: t.background.secondary, padding: 20, borderRadius: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    optionCircle: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: t.background.tertiary,
        alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    optionLetter: { fontSize: 16, fontWeight: '700', color: t.text.subtext },
    optionText: { flex: 1, fontSize: 16, color: t.text.body, fontWeight: '500' },

    // Result Styles
    resultScroll: { flexGrow: 1, paddingBottom: 40 },
    resultHeader: { padding: 30, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    navBar: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
    backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
    resultCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    resultInitial: { fontSize: 48, fontWeight: '800', color: '#FFF' },
    resultTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 8 },
    resultSub: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

    resultBody: { padding: 24 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: t.text.header, marginBottom: 16 },

    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tag: { backgroundColor: t.background.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    tagText: { fontSize: 14, color: t.text.header, fontWeight: '500' },

    tipRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    tipText: { flex: 1, fontSize: 15, color: t.text.body, lineHeight: 22 },

    btn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
    btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    secBtn: { paddingVertical: 16, alignItems: 'center' },
    secBtnText: { fontSize: 16, fontWeight: '600' },
});
