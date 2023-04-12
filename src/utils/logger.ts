import logger from 'pino';
import dayjs from 'dayjs';
import { timeStamp } from 'console';

const log = logger({
    base: {
        pid: false

    },
    timeStamp: () => `,"time":"${dayjs().format()}"`,
})

export default log;