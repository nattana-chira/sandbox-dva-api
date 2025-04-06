import { config } from './config';
import { server } from './web-socket';

const PORT = config.SERVER_PORT;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});