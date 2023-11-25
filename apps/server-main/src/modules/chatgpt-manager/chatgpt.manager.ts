import { System } from '../../system/system'
import OpenAI from 'openai'
import puppeteer from 'puppeteer'
import axios from 'axios'
import { BrokerYahoo, CANDLE_FIELD } from '@candlejumper/shared'
import { readFileSync } from 'fs'

export class ChatGPTManager {
  private brokerYahoo: BrokerYahoo

  constructor(public system: System) {}

  /**
   * - load alphavantage and new instance of broker
   * - start interval
   */
  async init() {
    this.brokerYahoo = new BrokerYahoo(this.system)

    // await this.headlessQuery()
    // console.log(this.system.configManager.config.thirdParty.openAI.apiKey)
    // const openai = new OpenAI({
    //   apiKey: this.system.configManager.config.thirdParty.openAI.apiKey
    // });
    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "system", content: "You are a helpful assistant." }],
    //   model: "gpt-3.5-turbo",
    //   response_format: { type: "json_object" },
    // });
    // console.log(completion.choices[0]);
  }

  async test() {
    // const cookies = 'intercom-device-id-dgkjq2bp=84c38580-3df6-4549-92ae-33723419a4fd; __stripe_mid=0fcd508c-c393-42c3-a342-987445ba47dfcfd8bb; _cfuvid=OyYFqEd0KhEfOaUdElSzM3wWzrUAqxuJJKawiMyTzLw-1700907430509-0-604800000; cf_clearance=8wt3gO3X0wllxvxIXnlqnlhjqilU90l49UytMGw13ZU-1700907431-0-1-35530993.723d5efc.530a57f6-0.2.1700907431; _cfuvid=ABhlFrpLEjuGb7wHqeZ6kH1G2g_uxCKvGSSrZBJh5GQ-1700907649253-0-604800000; cf_clearance=60DwGz7Ga0VI74LkT6uuVq0IJkXk2Q5fNc33hz_oMa4-1700907650-0-1-35530993.723d5efc.530a57f6-0.2.1700907650; __Host-next-auth.csrf-token=7f032dcacaaa797a3824c783b6279da3e2ad20c6ec848614437ad3eaa882e653%7C7fa95d35b4cfe91069fb0062650f42522c19871d2cb797f2b3c056b497680c48; ajs_user_id=user-3bAq5sYp5jF1ezAQV0HNPfA1; ajs_anonymous_id=463182bd-3a98-40a4-93fe-f8dd04f6870a; ajs_user_id=user-3bAq5sYp5jF1ezAQV0HNPfA1; _puid=user-3bAq5sYp5jF1ezAQV0HNPfA1:1700910305-ktJihx3vWpydRcLR23GMJz3uKDvcJfQZeq1U5MORshA%3D; __cflb=0H28vVfF4aAyg2hkHFH9CkdHRXPsfCUfFKjijXEiHbb; __cf_bm=gBBHc9VSUuxCHpOCWeHvfo7TW9m6ompkbPEx5LVsKm8-1700922943-0-ATUovEneg9+jYfnk+kWFm18wLTbPwkV+4MQCgS7FFvSZ1hk5GE/Nk2yH5W7CxC/ItBNL08ODdD0G8ZEwr5UDGYU=; __Secure-next-auth.callback-url=https%3A%2F%2Fchat.openai.com; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..zNG4B-cSY3qXIgiq.SJ6c_EgWoW4v3QCRrlL0azMBLzEEGdMsVKUx8pIszICNFlbxd0ocexcD5PEtv34gnn_8ZiTQjThV2QG1n0OCb-WR4SpVHKBur77NW0GkVzHchItb9Lf03OoMMwbgubR9-7xUaOXsHC9xUAVIVC67uPdPg_D55kp2rW-eXq-xr-snBflj8mJ3BOWMomTNdv4v_-6YTJm1KWmUdi6TJC0r1UiufVM6bxGrLP5Ln8vkDyGozltsU3g3Guf6Xt8uWVEq9p4F1T7ggcad2_XlXc6_eTBeQuPBvLShv9o59tJmhMwz0W50CC_L3n54rn2EbzL0oCV13I4X71SrI1w529BcA8dSNXoKwL0JuvDtNqpaeMUvzjTq3LDTKpDmRDBTmkDaaed2cDnyaQnWzJ6ZAeIGSU0GGpt--NP_-478024C8hCD0V4hXms8vATvTDsdV9jZQBpCEDgHH33e_OcG3uASlpxZKhP-QnsD8nJfAAfbV8dCfkxXWnmZNRtGqzv-OlAtwr_7Sq9jNtOEz1C4B2BC_jKBmufhLlyovmVTAfixsExQBu3-gSOUcBQhuRBYichk61XO_nxItmj6VpZIqGTWwxlM_sPijm7S0st9JjTBN3rXwtWwul8ySUzHgGWy5RdlGWuRWyVom54zzG7dsWpJ3pJfUaYGPqvn9dEXgfcnaMDElYMTKil695bj3uUMj-9qjPlcBfjVj3vXCXIGUnzu0ku4RfRFDWT256UD6sCUAjjtcZ0MeQanqj26hfwQcFqYwU_ZiBMh6QKVHE0tPlvFwj381IgYeehmfiuWl0Dh1aAeMp9IlNg4mnlPGEDlgA07-NWQQ1vc5J3wbEs4OoRXJrv2WNv9wnpGOgXvEebgAs_8qKjgoEx2RgZh75_FYkbdWiZg7xqP7usnUCsoc4dRMEauOJky6ob1MXloEx9xduJ9EaBm_vf2Fxcx6WPIRxymTuqDH-695T3aBaRrGwyjPw3Xz3O3MNFX8n7QHisYbvPbO5hwX8gAfB6S_YfJEIrs9Bay7-ptt7KGwpsjMo70wNxt9NSLbm97m5GiNr6pv-J51Go7qtmAW4qhiW9xWhrIp8VaFGggvmgQ189wHD2vYoDiI1Pn5rrNExC8aZFiBNLiKiVMQ8vRRrBic-n08gSB8jiC5va0ubAOFalNijXf6yWroFrMm6WOBX9lp3bzVyXAqiONGd-fHpjOgkve6JMOHkKZ53GSpO7biQXysPU4L90_fssTFPKN-KwgHqiK40ZbVBkhGU08jDfvHpyZPa_DL5_kt7LUaXH0DG3sXlXmvdGBSrNzupaQdXiDKvv8sEnRTubMz-DbCbLVJbLfqRDvpNHL7XiN20PIQSK9CP97rY8kWWme7qurUWT8Veo-KpQnXAeRUDI8xyqmIj6Ib2nEOLBJd4PFbd7ez912LKybf9hb8pGjRYiQ5E7f9Au4ni2iQ7AAWcZsn8fODuD8uL0BWQGFxKyz20QPet4Fz5KTx4QQ9EcXIzc4eppJGJt_vZ_lP93dRXPwQBPQKaIdE-nwh27tKH90H3J8989GTX0TyqOHuvsTOoDSv9nEYuqk9bSP5EQV3DG19au13rftmKvB6HbwMhTm2COiQ-YX-bQH2cblpnVE6kdMErIuK1Q0fZlDhEjafZu82MjOqFLp6xGVFES8NWv9TJ7cAgTKuelWB5WYDgBWgDyOcs9x_HTaiDS_dYjm-TytU71Hz_6OO5-HlN12yVIYyVOBhXVl5a9oT8ipo5PPv3LZwSJDhVRaPHQubsGe2jjP4-hq2I4kFaBtGfLX-VD_KZNPt5c0HJw2XrFahXalN7w151BQONShB269uohR66SXpbW4Dk_mxwZ72vFj7H1qcOyqg0Yt7Y61SVeX12Uxc88LPNBJkZEXso3xNR3SMRK8YJdYTDh3PPm5itFL_rMxJ4lMeQSAkC_bApX1Uf8CEiSVQ-2Og0bFCNuQMyh6cRYyccUL7wSVB0ROhOvMuN7nYcNTdgnxkoUxXK28OSX_KDuuyDS3oVt_V28SOGEUJejflYgx40ESbXKgv2rrdA4QXV6FZTP45CdLm_rLd4idRAyzJPmnvlCrGK4yl9qiZ_Ys0NqslTqfD1WXXYi94lozuuZ5ugOCBM0Ag4eKF04_vkCr16ffAQHdVFNSGveumHRDU9zLUgFNYBODCLVMa1-jVYxTqU0zQllfm69xqQ3xTKrUQU5u2XVS21E2lhh8I3Mmup04RUXDFAOm921OxOz3fOafa-ReX_uAb3EsPFsCSIG-euHmqrUGh4Bf5TbNXMCtciiTeuQjF_IwCE79Run6YOy9UvQm11rNUXkZwvgFiF4x03sI_Xj8GMUSOUOxpb5IFomixLgYR1KRUB493uBtXivBUiCqbSLyj9xaK6ssDdjDQCth3aRZf7RPZBjGhURpIabz1mk1xajPr-IJ4e3so50KDkMnMgUZmfmyN2sGUtiM04m6iQ0p_UJu0GwmJQ_GVZmx5if2kUPuDTirGKsWymAszrVOkaqBAUJJlPt_TEzWirBSH4P8lcahv9mYCXcj5T4rafVP36VPHwAEXbSTIZM5aSJhZTcXl3ZMt_Q-gibxrucVFs3XO_1E7aA71jIthkNFjCv5sB6lWK-2O2fe0djAnzQZHsbTlusfDtUkgqORp8bn9jCZ7Ysv6aNd9W80M71PBKtYIJbRY4ATHh_ZQYpfIQ5duopkb_c3FymsWPRTufiN7KaKcAXKkkTnrSaAYaREUICKjlfDvA5uAa_XtzZAshtdUfXNIyel9E7iOrSrOj5r702A1BB0wkwr7fnGhwHdSeiA5ZFS4umzlcc2iq9X5-VGmmvIjlO69BZJMtKqtN8Sk0cPBmGzas3o_COCNB1qaFljf2FOVwHB-womnaY_3fdG9lK2PO26KfUlckkHsPYg0g.ZSc_mITIV2vDEnrwWTSGvw; _puid=user-3bAq5sYp5jF1ezAQV0HNPfA1:1700923005-YXUdlGv6kUmFNjPEgL6vUcwp7tHKHcrupGhQWe3kx6w%3D; intercom-session-dgkjq2bp=YUR3NkpqdEZLVEpXamM1YUFyc0w4b0FBZHlQbnVnMm95SHR5LytNbGovckY0ekc0K2JTd3JocmhxMG8zZUFCVy0tbVl3VkQ5VXVUWTlpVEdiK1A1cVM0dz09--6cceb77bcdd3ebb15f9effb1cf689aa86c33287a; _dd_s=rum=0&expire=1700924013183'
    const cookies = readFileSync('chatgpt.token.txt', 'utf-8')
    console.log(3434, cookies)
    try {
      const result = await axios.get('https://chat.openai.com/', {
        withCredentials: true,
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          AcceptLanguage: 'en-US,en;q=0.9',
          Connection: 'keep-alive',
          Cookie: cookies,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
          Referer: 'https://chat.openai.com/?model=gpt-4',
        },
      })

      const newCookies = result.headers['set-cookie']

      const session = await this.createSession(cookies)
      // return result.data
      const askResult = await this.ask(cookies, session.accessToken)
      return askResult
    } catch (error) {
      console.error(2323)
      console.error(error)
    }
  }

  async ask(cookies, token) {
    const candles = await this.brokerYahoo.getCandlesFromCount('AMZN', '1d', 160)
    const normalized = candles.map((candle) => ({
      time: candle[0],
      close: candle[1],
    }))
    const openOnly = candles.map((candle) => candle[CANDLE_FIELD.OPEN])
    return new Promise(async (resolve, rejct) => {
      let lastResponse

      const { data } = await axios.post(
        'https://chat.openai.com/backend-api/conversation',
        {
          action: 'next',
          messages: [
            {
              id: "aaa2f8c2-acb5-4436-a78e-4674afebd67c",
              author: {
                role: 'user',
              },
              content: {
                content_type: 'text',
                parts: ['what is 1 + 1023?'],
                // parts: [JSON.stringify(normalized), 'This is an array of candle data. Timeframe is 1 day. After you calculated the RSI and SMA. Do you think it will go up for at least 1 day?'],
                // parts: [candles.join(), 'Dit is data van een candle grafiek.kun je hier een analyse van maken ? is het een goed inkoop moment?'],
              },
              metadata: {},
            },
          ],
          arkose_token
: 
"110179ae79678f341.9310071305|r=eu-west-1|meta=3|metabgclr=transparent|metaiconclr=%23757575|guitextcolor=%23000000|pk=35536E1E-65B4-4D96-9D97-6ADB7EFF8147|at=40|sup=1|rid=94|ag=101|cdn_url=https%3A%2F%2Ftcr9i.chat.openai.com%2Fcdn%2Ffc|lurl=https%3A%2F%2Faudio-eu-west-1.arkoselabs.com|surl=https%3A%2F%2Ftcr9i.chat.openai.com|smurl=https%3A%2F%2Ftcr9i.chat.openai.com%2Fcdn%2Ffc%2Fassets%2Fstyle-manager"
,
          // conversation_id: 'ad409153-7201-464f-a6af-69602071a943',
          parent_message_id: "aaa1cc87-8eca-4467-94fb-f719b0b70a99",
          model: 'gpt-4',
          // model: 'text-davinci-002-render-sha',
          timezone_offset_min: -60,

          history_and_training_disabled: false,
          conversation_mode: {
            kind: 'primary_assistant',
          },
          suggestions: [],
          force_paragen: false,
          force_rate_limit: false,
        },
        {
          responseType: 'stream',
          withCredentials: true,
          headers: {
            Dnt: 1,
            Origin: 'https://chat.openai.com',
            'Sec-Fetch-Site': 'same-origin',
            Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJkaWVjb2luQG91dGxvb2suY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy1UclQ0SEJGOE5CMlBJaUxLMTFZVlVVRHMiLCJ1c2VyX2lkIjoidXNlci0zYkFxNXNZcDVqRjFlekFRVjBITlBmQTEifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6ImF1dGgwfDYzYzZmMDM5M2Y0NzQ3YWNkNGI0YjBiMyIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MDA5MTAyMDcsImV4cCI6MTcwMTc3NDIwNywiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvcmdhbml6YXRpb24ud3JpdGUgb2ZmbGluZV9hY2Nlc3MifQ.WmP4h-jnUoVU6KDLgEMVSkQ9nxvSYYh_Pndi90_NrFqZPS-93M0GT1a8Lecl4sQHwE36l837UBUB8eP1JrcD9SWsUpzMaa88SIkM2UBMEtv2yKfq_7x8L9xzndC8tiA2fwc8zeV6l-gDq74rlvahi41yBdb8SX641fCLP8Ckc8-Zw4uHcS0XMNf0KROBiMLuxFU9lYW2dy7Wx1_GhtjmCMPx77uUgv_jex6Hkfw4CNFXR3aEahM2V_pMFX3IepRqmKh4CdRBYornjGKSmv970xRjqIzY02nXv7mmIEyoQKpRdSwmAInDr4tJfyqFFC-nsc5rGXfm4qDxhPMJaBgBSw',
            // Authorization: 'Bearer ' + token,
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            AcceptLanguage: 'en-US,en;q=0.9',
            Connection: 'keep-alive',
            Cookie: cookies,
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
            Referer: 'https://chat.openai.com/',
          },
        },
      )

      data.on('data', (data) => {
        console.log(data.toString())
        if (data.toString().startsWith('data: ')) {
          const string = data.toString('utf-8').slice(6).replaceAll("'", '')

          if (!string.includes('[DONE]')) {
            try {
              const response = JSON.parse(string)
              if (!response.is_completion) {
                lastResponse = response
              }
            } catch (error) {
              console.log(898989, string, error)
            }
          }
        } else {
          console.log(56565, data.toString())
        }
      })

      data.on('end', () => {
        resolve(lastResponse)
      })
    })
  }

  async createSession(cookies) {
    const result = await axios.get('https://chat.openai.com/api/auth/session', {
      withCredentials: true,
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        AcceptLanguage: 'en-US,en;q=0.9',
        Connection: 'keep-alive',
        Cookie: cookies,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
        Referer: 'https://chat.openai.com/',
      },
    })

    return result.data
  }

  async headlessQuery() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://chat.openai.com/')
    let source = await page.content()
    console.log(source)
    // await browser.close();
  }
}
