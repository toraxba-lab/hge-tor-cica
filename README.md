# hge-tor-cica
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>Sistema HGE - Painel de Teste</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background-color: #e9ecef; display: flex; justify-content: center;">

  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 500px; width: 100%;">
    <h2 style="color: #2c3e50; margin-top: 0;">Painel de Controle HGE</h2>
    <p style="color: #7f8c8d;">Registre um procedimento para validar o banco de dados:</p>
    
    <div style="margin-top: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Procedimento / Aviso:</label>
      <input type="text" id="campoProcedimento" placeholder="Ex: Broncoscopia Rígida - Sala 4" 
             style="padding: 12px; width: 100%; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; font-size: 16px;">
    </div>

    <button onclick="enviarDados()" 
            style="margin-top: 20px; padding: 14px; width: 100%; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background 0.3s;">
      Enviar para o Firestore
    </button>

    <div id="status" style="margin-top: 20px; padding: 10px; border-radius: 4px; text-align: center; display: none;"></div>
  </div>

  <script>
    // Suas chaves de API já configuradas
    const firebaseConfig = {
      apiKey: "AIzaSyDwfSkb619C8BCaNdpyUQWrREAFiaHVrvs",
      authDomain: "studio-7546259198-6664c.firebaseapp.com",
      projectId: "studio-7546259198-6664c",
      storageBucket: "studio-7546259198-6664c.firebasestorage.app",
      messagingSenderId: "931953990589",
      appId: "1:931953990589:web:1395eacb6b63e4172450d4"
    };

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    function enviarDados() {
      const proc = document.getElementById('campoProcedimento').value;
      const statusDiv = document.getElementById('status');

      if (!proc
