import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Loader } from 'lucide-react-native';

export type ProgressStep = {
  id: string;
  label: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'error';
};

type ProgressIndicatorProps = {
  steps: ProgressStep[];
  currentStepId: string;
  statusMessage: string | null;
  error: string | null;
};

export default function ProgressIndicator({ 
  steps, 
  currentStepId, 
  statusMessage, 
  error 
}: ProgressIndicatorProps) {
  // Animation for the spinner
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Start the spinner animation when the component mounts
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    spinAnimation.start();
    
    return () => {
      spinAnimation.stop();
    };
  }, []);
  
  // Map the spin value to a rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate the current step index
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  
  // Calculate progress percentage
  const progress = currentStepIndex >= 0 
    ? (currentStepIndex / (steps.length - 1)) * 100 
    : 0;

  return (
    <BlurView intensity={30} style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      
      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View 
              style={[
                styles.stepIndicator,
                step.status === 'completed' && styles.stepCompleted,
                step.status === 'in-progress' && styles.stepInProgress,
                step.status === 'error' && styles.stepError,
              ]}
            >
              {step.status === 'in-progress' && (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Loader size={16} color="#fff" />
                </Animated.View>
              )}
              {step.status === 'completed' && (
                <Text style={styles.stepCompletedText}>✓</Text>
              )}
              {step.status === 'error' && (
                <Text style={styles.stepErrorText}>!</Text>
              )}
              {step.status === 'waiting' && (
                <Text style={styles.stepWaitingText}>{index + 1}</Text>
              )}
            </View>
            <Text 
              style={[
                styles.stepLabel,
                step.status === 'in-progress' && styles.stepLabelActive,
                step.status === 'completed' && styles.stepLabelCompleted,
                step.status === 'error' && styles.stepLabelError,
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Status message */}
      {statusMessage && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      )}
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 3,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepInProgress: {
    backgroundColor: '#4a90e2',
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepError: {
    backgroundColor: '#F44336',
  },
  stepWaitingText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepCompletedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepErrorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  stepLabelCompleted: {
    color: '#4CAF50',
  },
  stepLabelError: {
    color: '#F44336',
  },
  statusContainer: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusText: {
    color: '#4a90e2',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
  },
});
