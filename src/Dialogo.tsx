import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { cores, fontes, raio } from './theme';

type Props = {
  visivel: boolean;
  icone: React.ComponentProps<typeof Feather>['name'];
  titulo: string;
  texto: string;
  /** Texto do botão principal. */
  confirmar: string;
  aoConfirmar: () => void;
  /** Com `aoCancelar`, aparece o botão "Cancelar" ao lado; sem ele, só o botão principal. */
  aoCancelar?: () => void;
};

/** Janelinha de confirmação no estilo do app (no lugar do alerta padrão do sistema). */
export function Dialogo({ visivel, icone, titulo, texto, confirmar, aoConfirmar, aoCancelar }: Props) {
  const fechar = aoCancelar ?? aoConfirmar;
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={fechar} statusBarTranslucent>
      <Pressable style={s.fundo} onPress={fechar} accessibilityLabel="Fechar a janela">
        {/* o cartão captura o toque para não fechar ao tocar nele */}
        <Pressable style={s.cartao} onPress={() => {}} accessibilityViewIsModal>
          <View style={s.icone}><Feather name={icone} size={26} color={cores.marinho} /></View>
          <Text style={s.titulo}>{titulo}</Text>
          <Text style={s.texto}>{texto}</Text>
          <View style={s.botoes}>
            {aoCancelar ? (
              <Pressable onPress={aoCancelar} accessibilityRole="button" style={({ pressed }) => [s.botao, s.secundario, pressed && { opacity: 0.8 }]}>
                <Text style={[s.botaoTxt, { color: cores.marinho }]}>Cancelar</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={aoConfirmar} accessibilityRole="button" style={({ pressed }) => [s.botao, s.principal, pressed && { opacity: 0.88 }]}>
              <Text style={[s.botaoTxt, { color: '#fff' }]}>{confirmar}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(16,23,26,0.52)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  cartao: {
    width: '100%', maxWidth: 360, backgroundColor: cores.card, borderRadius: raio.xl, padding: 24, alignItems: 'center',
    boxShadow: '0px 12px 32px rgba(16,23,26,0.28)',
  },
  icone: { width: 60, height: 60, borderRadius: 30, backgroundColor: cores.ceuClaro, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titulo: { fontFamily: fontes.bold, fontSize: 20, color: cores.marinho, textAlign: 'center' },
  texto: { fontFamily: fontes.regular, fontSize: 15, lineHeight: 22, color: cores.textoSuave, textAlign: 'center', marginTop: 8 },
  botoes: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 22 },
  botao: { flex: 1, minHeight: 48, borderRadius: raio.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  principal: { backgroundColor: cores.marinho },
  secundario: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: cores.bordaForte },
  botaoTxt: { fontFamily: fontes.semibold, fontSize: 15 },
});
