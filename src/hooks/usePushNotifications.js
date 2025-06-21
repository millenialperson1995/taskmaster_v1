import { useState, useEffect } from 'react';
import { account } from '../api/appwrite';
import toast from 'react-hot-toast';

const VITE_VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ALTERADO: Removido o "export const" daqui
const usePushNotifications = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(sub => {
                if (sub) {
                    setIsSubscribed(true);
                }
            });
        });
    }, []);

    const subscribeUser = async () => {
        if (!VITE_VAPID_PUBLIC_KEY) {
            console.error("Chave VAPID pública não encontrada. Defina VITE_VAPID_PUBLIC_KEY no seu arquivo .env");
            toast.error("Configuração de notificação incompleta.");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VITE_VAPID_PUBLIC_KEY),
            });
            
            console.log('Usuário inscrito:', subscription);

            // !! IMPORTANTE !!
            // Enviar `subscription` para a sua Appwrite Function aqui.
            
            // --- CORREÇÃO DE BUG ADICIONAL ---
            // Buscamos as preferências atuais antes de atualizá-las.
            const prefs = await account.getPrefs();
            await account.updatePrefs({ ...prefs, pushSubscribed: true });
            // ---------------------------------

            toast.success('Você receberá notificações!');
            setIsSubscribed(true);

        } catch (error) {
            console.error('Falha ao inscrever o usuário: ', error);
            toast.error('Não foi possível ativar as notificações.');
        }
    };
    
    const requestPermissionAndSubscribe = async () => {
        if (permission === 'granted') {
            await subscribeUser();
        } else if (permission === 'default') {
            const newPermission = await Notification.requestPermission();
            setPermission(newPermission);
            if (newPermission === 'granted') {
                await subscribeUser();
            } else {
                toast.error('Permissão para notificações negada.');
            }
        } else {
            toast.error('As notificações estão bloqueadas. Altere nas configurações do seu navegador.');
        }
    };

    return {
        permission,
        isSubscribed,
        requestPermissionAndSubscribe,
    };
};

// ADICIONADO: Exporta a função como padrão
export default usePushNotifications;