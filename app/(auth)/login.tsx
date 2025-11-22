import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSession } from '../../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useSession();
    const [email, setEmail] = useState('nafed25458@canvect.com');
    const [password, setPassword] = useState('nafed25458@canvect.com');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // TODO: Implement API integration
        console.log('Login attempt with:', { email, password });
        // For now, just navigate to tabs to show flow
        signIn();
        router.replace('/(protected)' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={['#2563EB', '#4F46E5']}
                                style={styles.iconGradient}
                            >
                                <Ionicons name="business" size={scale(32)} color="#FFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to your investor account</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="mail-outline"
                                    size={scale(20)}
                                    color="#94A3B8"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#CBD5E1"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.lastInputWrapper}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={scale(20)}
                                    color="#94A3B8"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#CBD5E1"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={scale(20)}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#2563EB', '#4F46E5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.loginButtonText}>Sign In</Text>
                                <Ionicons name="arrow-forward" size={scale(20)} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By signing in, you agree to our{' '}
                            <Text style={styles.linkText}>Terms</Text> and{' '}
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: moderateScale(24),
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(20),
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(40),
    },
    iconContainer: {
        marginBottom: verticalScale(24),
        shadowColor: '#2563EB',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    iconGradient: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(24),
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-10deg' }],
    },
    title: {
        fontSize: moderateScale(28),
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: verticalScale(8),
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: moderateScale(16),
        color: '#64748B',
        textAlign: 'center',
    },
    formContainer: {
        marginBottom: verticalScale(24),
    },
    inputWrapper: {
        marginBottom: verticalScale(20),
    },
    lastInputWrapper: {
        marginBottom: verticalScale(32),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#334155',
        marginBottom: verticalScale(8),
        marginLeft: scale(4),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: verticalScale(56),
        paddingHorizontal: scale(16),
        shadowColor: '#94A3B8',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        marginRight: scale(12),
    },
    input: {
        flex: 1,
        fontSize: moderateScale(16),
        color: '#1E293B',
        height: '100%',
    },
    eyeIcon: {
        padding: scale(4),
    },
    loginButton: {
        borderRadius: moderateScale(16),
        overflow: 'hidden',
        shadowColor: '#2563EB',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(56),
        paddingHorizontal: scale(24),
    },
    loginButtonText: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: scale(8),
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
    },
    footerText: {
        fontSize: moderateScale(12),
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: verticalScale(18),
    },
    linkText: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
