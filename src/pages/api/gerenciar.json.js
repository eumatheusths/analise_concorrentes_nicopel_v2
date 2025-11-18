// src/pages/api/gerenciar.json.js
import { google } from 'googleapis';

const getAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: import.meta.env.GOOGLE_CLIENT_EMAIL,
      private_key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// ... MANTENHA OS MÉTODOS DELETE E PUT AQUI SE JÁ EXISTIREM ...
// (Vou colocar apenas o novo método PATCH abaixo, adicione ao final do arquivo)

// --- MÉTODO PATCH (Atualizar apenas Produtos) ---
export async function PATCH({ request }) {
  try {
    const data = await request.json();
    const linha = data.linha;
    const produtosJson = JSON.stringify(data.produtos); // Converte array para texto

    if (!linha) throw new Error("Linha não informada");

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Atualiza APENAS a coluna K daquela linha
    const range = `Página1!K${linha}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[produtosJson]] }
    });

    return new Response(JSON.stringify({ message: 'Produtos atualizados' }), { status: 200 });
  } catch (error) {
    console.error("Erro PATCH:", error);
    return new Response(JSON.stringify({ error: 'Erro ao salvar produtos' }), { status: 500 });
  }
}

// Se você não tiver os outros, me avise, mas assumo que DELETE e PUT já estão lá do passo anterior.
