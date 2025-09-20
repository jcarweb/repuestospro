import React from 'react';
import { View, Text, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#1A1A1A', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20
    }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      <Text style={{ 
        fontSize: 40, 
        fontWeight: 'bold', 
        color: '#FF0000', 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        🔥 METRO BUNDLER CONECTADO 🔥
      </Text>
      
      <Text style={{ 
        fontSize: 24, 
        color: '#00FF00', 
        marginBottom: 20, 
        textAlign: 'center' 
      }}>
        ESTE ES EL ARCHIVO CORRECTO
      </Text>
      
      <Text style={{ 
        fontSize: 18, 
        color: '#FFFFFF', 
        textAlign: 'center',
        lineHeight: 30
      }}>
        Si ves este texto, el Metro bundler{'\n'}
        está funcionando correctamente{'\n'}
        y sirviendo el código actualizado
      </Text>
    </View>
  );
}
