import { GoogleSpreadsheet } from 'google-spreadsheet'
import { Telegraf } from 'telegraf'
const bot = new Telegraf(process.env.BOT_TOKEN)
import 'dotenv/config'
const doc = new GoogleSpreadsheet(
  '1qHg3PQmBv0S1ZBGHiOmFHSUPkpIH0aK9Q4Vjlx0-0qw'
)

const app = async (ctx = 'hello') => {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })
  await doc.loadInfo()
  let sheet
  const flag = ctx.slice(0, 2).toUpperCase()
  if (flag === 'ПТ') {
    sheet = doc.sheetsByIndex[0]
  }
  if (flag[0] === 'М') {
    sheet = doc.sheetsByIndex[2]
  }
  if (flag === 'П-') {
    sheet = doc.sheetsByIndex[3]
  }
  if (flag === 'Э-') {
    sheet = doc.sheetsByIndex[4]
  }
  if (flag === 'У-') {
    sheet = doc.sheetsByIndex[5]
  }
  if (flag === 'ТР') {
    sheet = doc.sheetsByIndex[6]
  }

  if (!sheet) sheet = doc.sheetsByIndex[0]

  const rows = await sheet.getRows()

  const qustion = []
  const answer = []

  rows.forEach((row) => {
    const [first, second] = row._rawData
    if (first === 'в') qustion.push(second)
    if (first === 'п') answer.push(second)
  })

  let result = []
  qustion.forEach((item, index) => {
    const ticket =
      /У-\d*/.exec(item) ||
      /ПТЭ\d*/.exec(item) ||
      /Э-\d*/.exec(item) ||
      /М\d*/.exec(item) ||
      /ТРА\d*/.exec(item) ||
      /П-\d*/.exec(item)
    if (ticket == ctx.toUpperCase().trim()) {
      result.push(`${answer[index]}`)
    }
  })
  if (result.length > 1) {
    return result
  } else {
    result.push('я не нашел информацию')
    return result
  }
}

async function start() {
  bot.start(async (ctx) => await ctx.reply('привет!'))
  bot.help((ctx) => ctx.reply('отправь боту номер вопроса'))
  bot.on('text', async (ctx) => {
    const answer = await app(ctx.message.text)
    await ctx.reply(...answer)
  })
  bot.launch()

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

start()
