// src/pages/api/gerenciar.json.js
import { google } from 'googleapis';

// --- 1. Autenticação Reutilizável ---
// (Usada por todas as funções abaixo)
const getAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: import.meta.env.GOOGLE_CLIENT_EMAIL,
      private_key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// --- 2. DELETE (Excluir Linha) ---
export async function DELETE({ request }) {
  try {
    const { linha } = await request.json();
    
    if (!linha || linha < 2) throw new Error("Linha inválida.");

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const startIndex = parseInt(linha) - 1; 

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, 
              dimension: "ROWS",
              startIndex: startIndex,
              endIndex: startIndex + 1
            }
          }
        }]
      }
    });

    return new Response(JSON.stringify({ message: 'Deletado' }), { status: 200 });
  } catch (error) {
    console.error("Erro DELETE:", error);
    return new Response(JSON.stringify({ error: 'Erro ao deletar' }), { status: 500 });
  }
}

// --- 3. PUT (Editar Dados da Empresa) ---
export async function PUT({ request }) {
  try {
    const data = await request.json();
    const linha = data.linha;

    if (!linha) throw new Error("Linha não informada.");

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Salva da Coluna A até J (Sem mexer nos produtos na K)
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

    const range = `Página1!A${linha}:J${linha}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    return new Response(JSON.stringify({ message: 'Atualizado' }), { status: 200 });
  } catch (error) {
    console.error("Erro PUT:", error);
    return new Response(JSON.stringify({ error: 'Erro ao editar' }), { status: 500 });
  }
}

// --- 4. PATCH (Salvar Tabela de Produtos) ---
export async function PATCH({ request }) {
  try {
    const data = await request.json();
    const linha = data.linha;
    // Converte o array de produtos em Texto JSON para salvar na célula
    const produtosJson = JSON.stringify(data.produtos || []); 

    if (!linha) throw new Error("Linha não informada");

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Atualiza APENAS a coluna K (Coluna 11)
    const range = `Página1!K${linha}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[produtosJson]] }
    });

    return new Response(JSON.stringify({ message: 'Produtos salvos' }), { status: 200 });
  } catch (error) {
    console.error("Erro PATCH:", error);
    return new Response(JSON.stringify({ error: 'Erro ao salvar produtos' }), { status: 500 });
  }
}
