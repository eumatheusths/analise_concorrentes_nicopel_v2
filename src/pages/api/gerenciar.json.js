// src/pages/api/gerenciar.json.js
import { google } from 'googleapis';

// Função de Autenticação Reutilizável
const getAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: import.meta.env.GOOGLE_CLIENT_EMAIL,
      private_key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// --- MÉTODO DELETE (Excluir Linha) ---
export async function DELETE({ request }) {
  try {
    const { linha } = await request.json();
    
    if (!linha || linha < 2) {
      throw new Error("Número da linha é inválido.");
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // API do Google Sheets usa índice 0 (Linha 1 = 0, Linha 2 = 1)
    const startIndex = parseInt(linha) - 1; 

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // 0 = Primeira aba
              dimension: "ROWS",
              startIndex: startIndex,
              endIndex: startIndex + 1 // Exclui 1 linha
            }
          }
        }]
      }
    });

    return new Response(JSON.stringify({ message: 'Excluído com sucesso' }), { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return new Response(JSON.stringify({ error: 'Erro ao excluir registro' }), { status: 500 });
  }
}

// --- MÉTODO PUT (Editar Linha) ---
export async function PUT({ request }) {
  try {
    const data = await request.json();
    const linha = data.linha; // Número da linha (ex: 2, 3, 4...)

    if (!linha || linha < 2) {
      throw new Error("Número da linha é inválido.");
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Ordem exata das colunas (A até J)
    const values = [[
      data.seguimento,
      data.nome.toUpperCase(),
      data.site,
      data.instagram,
      data.meta_ads,
      data.google_ads,
      data.regiao.toUpperCase(),
      data.ticket,
      data.minimo,
      data.ameaca
    ]];

    // Define o range exato da linha, ex: 'Página1!A5:J5'
    const range = `Página1!A${linha}:J${linha}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    return new Response(JSON.stringify({ message: 'Atualizado com sucesso' }), { status: 200 });
  } catch (error) {
    console.error("Erro ao editar:", error);
    return new Response(JSON.stringify({ error: 'Erro ao editar registro' }), { status: 500 });
  }
}