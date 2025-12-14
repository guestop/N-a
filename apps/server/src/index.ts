import 'dotenv/config';

import { createApp } from './app.js';

const port = Number(process.env.SERVER_PORT ?? 3001);

const app = createApp();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
