// src/pages/api/concorrentes.json.js
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: import.meta.env.GOOGLE_CLIENT_EMAIL,
    private_key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      // AGORA VAI ATÉ A COLUNA K (Para ler os Produtos)
      range: 'Página1!A:K', 
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }

    const data = rows.slice(1).map((row, index) => {
      return {
        id_linha: index + 2, // Guardamos o número da linha para poder salvar depois
        seguimento: row[0] || '',
        nome: row[1] || '',
        site: row[2] || '',
        instagram: row[3] || '',
        meta_ads: row[4] || '',
        google_ads: row[5] || '',
        regiao: row[6] || '',
        ticket_medio: row[7] || '',
        pedido_minimo: row[8] || '',
        ameaca: row[9] || 'BAIXA',
        // Se a célula estiver vazia, retornamos um array vazio '[]'
        produtos: row[10] ? JSON.parse(row[10]) : [] 
      };
    });

    return new Response(JSON.stringify({ data }), { status: 200 });

  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar dados' }), { status: 500 });
  }
}
