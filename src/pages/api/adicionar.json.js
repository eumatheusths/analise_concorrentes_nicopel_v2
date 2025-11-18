// src/pages/api/adicionar.json.js
import { google } from 'googleapis';

export async function POST({ request }) {
  try {
    const data = await request.json();
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: import.meta.env.GOOGLE_CLIENT_EMAIL,
        private_key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        data.seguimento,
        data.nome.toUpperCase(),
        data.site,
        data.instagram,
        data.meta_ads,
        data.google_ads,
        data.regiao.toUpperCase(),
        data.ticket,
        data.minimo,
        data.ameaca // Salva a nova coluna
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: import.meta.env.GOOGLE_SHEET_ID,
      range: 'Página1!A:J', // Ajustado para J
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return new Response(JSON.stringify({ message: 'Sucesso' }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 });
  }
}