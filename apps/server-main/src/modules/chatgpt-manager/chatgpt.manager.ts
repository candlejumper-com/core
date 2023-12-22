import { SystemMain } from '../../system/system'
import OpenAI from 'openai'
import puppeteer from 'puppeteer'
import axios from 'axios'
import { BrokerYahoo, CANDLE_FIELD, Service } from '@candlejumper/shared'
import { readFileSync } from 'fs'
import { ReadableStream } from 'stream/web'

@Service({})
export class ChatGPTManager {
  private brokerYahoo: BrokerYahoo


  /**
   * - load alphavantage and new instance of broker
   * - start interval
   */
  async init() {
    // this.brokerYahoo = new BrokerYahoo(this.system)

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
    const cookies =
      'intercom-device-id-dgkjq2bp=84c38580-3df6-4549-92ae-33723419a4fd; __stripe_mid=0fcd508c-c393-42c3-a342-987445ba47dfcfd8bb; _cfuvid=OyYFqEd0KhEfOaUdElSzM3wWzrUAqxuJJKawiMyTzLw-1700907430509-0-604800000; cf_clearance=8wt3gO3X0wllxvxIXnlqnlhjqilU90l49UytMGw13ZU-1700907431-0-1-35530993.723d5efc.530a57f6-0.2.1700907431; _cfuvid=ABhlFrpLEjuGb7wHqeZ6kH1G2g_uxCKvGSSrZBJh5GQ-1700907649253-0-604800000; cf_clearance=60DwGz7Ga0VI74LkT6uuVq0IJkXk2Q5fNc33hz_oMa4-1700907650-0-1-35530993.723d5efc.530a57f6-0.2.1700907650; __Host-next-auth.csrf-token=7f032dcacaaa797a3824c783b6279da3e2ad20c6ec848614437ad3eaa882e653%7C7fa95d35b4cfe91069fb0062650f42522c19871d2cb797f2b3c056b497680c48; ajs_user_id=user-3bAq5sYp5jF1ezAQV0HNPfA1; ajs_anonymous_id=463182bd-3a98-40a4-93fe-f8dd04f6870a; ajs_user_id=user-3bAq5sYp5jF1ezAQV0HNPfA1; _puid=user-3bAq5sYp5jF1ezAQV0HNPfA1:1700910305-ktJihx3vWpydRcLR23GMJz3uKDvcJfQZeq1U5MORshA%3D; __cf_bm=WxMywQUxlRP1SJWlueGRtpNMGa1_ipGdx.eOJj0rv1A-1700928674-0-AR56ISxKLu8eD09zfquY11DpC9APsK8StW13CZZrHhbAobPvfyMD584eLihrMGzg27Yy53+/zDA+oHv4usqE0FU=; __Secure-next-auth.callback-url=https%3A%2F%2Fchat.openai.com; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..HDI_jGqG6xZOY8uR.2Hhr2VKF1X9Gt_YrCPxZvvBb5VzYh9fcT78KsYikHCybu4gR_hTtN-t4B7I_0S9SwziNhfjCDNDSFyIInq2jgSk7ZCCgdkGEFLBcz7Ay4bbutYUCGQiNLrpHqI9275EQiXHkOwftC6SIp-o1qaOys8n-_fan-E4eqRSjc4eCLaVP4ch5b-gkPtagGYFk0veE6ojkzwzIvDC3r3h6XGTzWLqsecR5pakJQ3VR6IQYG9N5CJzifwj_SczWmvRbZlJ6tHZfogiJx5-dnM8872kJN7nyVtGPcBovE8aNv_s1dJOelpXaGs_m8DAOn4FiB9-HG-PAGRzVFUH_7n4XBrvMr-YcedUVLCZ7Fx-6yo6ZIpfi4BRIgAWtpALiD0X7fMAeLIzPyWFbgNp0buSTwlsMYgzcf0bD63_0CFzmmPLk13NMXe3fkJ2OVg-EgafT5JUOdo2YW6Oew74Cy5ddxoe1GOo7kAXCsMslkRdoCGP0EMgNyjCkVqB_dswMi7g_iT_6T5aG0Vp9bm91Mrrd3VHAKFjR9b1fIRH-QDj5-lOfsBoyxedKKvrT62565arUngGP7Ek-O33t4jOfa8JwNU4ply0VSqpJWSiUn3XNbJkvjqH5yBYcspJkGv_6V1BrumGkrkrqHqfQE2ALdAwW5HusT4tbpa992JUy41-sOo6wLSHOh2FwvlXHmMq5-ZYhRHG_G-gWEDCVZw1vNOLLjYeElrnVQ_tt0vrh0IHqsram_3-9Lj59FfsyKTAzbpZzQ_d_nFS0ZOnNRJ-kFFngo6NiGPJ3KBbLOpwPn93naaZOBV6SrogJGibZnuJRmyNPKSZUYwpNZo-0H02BMP-pPiqIu9RN4hMVexZ3MhadJyUWjk1VAHNT2_OZb3LdBRZSi4pi467z0YuFUOEnkHET1sWjh819RIWK5w1rHtasK_1WzgTb7MHpUdFp8okaeClfg77NECuafP4bMzEIpHTPJQ9Wv5ZniSDa1jLEA7kCY5vJxCnZwEguGNqQmqh75vzV32VvvLGSEFnXbBwF4ycBWpRML-VCvBZt1RkSH8E808If5B3S2XwEuGLjsiG1jpXZmdpSH43W-8vhB6XWuawT9H3GoivCCTiNnaSL32Q2nIENjTttWkg-Y8j99UndVbgNROCUi1SLcVKNG5-MkXGXI3Qg1N9qu5Uzji13t5dCqzH-2KT5rPT6OE95JiobbTzSGkU4d4W7vByA2UvsCtSsNNTPscXy4LYsecDalcJDu6YJeNhz7LSvqs4t-sKiElqrNzxKOIE2yE2_CfWGEbA7M-QwBjrgnXXJvTi1rg735RFzvG6nR7UKkb9RdvYiIa-_JvnrH8ERrhG9oqDgNZw8XTanrPM_mmcz8fYR_TO4ibiCbT0c-RdadGq2WBB4k49sim4Kn0ttmDB1PMBNwa_5KWLXAzTTKAq2kx20LWcwqvWlZUivRcPpXh9gbL8sLU7_ZeGuLiNSAMu3VGNOY7ayvx2SvPwhlNLBsOgPRvUJtQbIzqySUHoLdyyjxUiPRtpRBdvNHR6Lah6C4FpQ2FfZ07DAYIdtUv7klgVGKk7hqmPvs_cBVH4t3l_glLBCTRpajZG-8ch_QcvQNUl7s5jXPXlC3BmiTMg8v2fsRmsq1u0SUO1bM1RqFpO3wlKFir7O01SqzHSg97-3Lyt-QPH9SNuJLa-bEGb8S5SmoO-P6geY0Z0MW_w_uQ6KIz6MCN08pvcLBHr7WkQHY0WAxoC9CH2KrsaoBb8LJyB4X-ZID3DXk3jjA6EZp3ybb-1ONCeJ24_F6bnud4RPouG2oVYOjdVnCzhvgbJkZVJm96fqarQfWqfMviH0fVzZAJQe_LNFv5rt4YraVIbiQ1IQxEMfJ2v7MgpkOWSn1nAexntmnRILET79nyAJu3THzeuJeCCYcT22v_uEYebtquWamwnv8sQr2x7ZU53nanYWrqEh49fuCr74G4mVaW-Its5RsR2Udtql8gGEIhp4yL6t1dZuwu7o2oXFTXCOKLBOjvO5Vwe4FY5kXH2YNKx3sEPTFvdiEJ2Hyt_QHsKTXdqLkKfnIJ3YqcqBTLuvuSMTsULmMY7N16k0QVnfnmrrsGLOrPneMXPjyf7BP8HDn4JCB5C1a8hRnsr74b4WUuGNXOf42xFEZEfrWt_hzBke7Y_R8Y4Yau0pmABF22MBTf_4tS7Nd8RSz8WzR_36TMJhqJM_B4Tnl5jj-xIu98YJTLYsHuwLJ0OTlwYkAFRIMjtYi3I6V9rIleo4JLrCiT4HB7mvb6xoeiz9_5UeEf3eBGhlEQLscq6nVqm3LA38xBh9MqreWxgC8VHFM_gXUX-nkHfs0bTgDIAye2I_5S-uE6zRieretozsyLbrsUBsgfzkyvPYm6CCN4-N8Py-oTogPloxX2B65gFK2OILeE42vXNbIReM1FucB5YrOpxatNI0eYUqfsRgRBpd-gLoSS7lfouV8yifkl9BrlzQE4b5lWoo3hJH4z4On0KNsjWPWVrvW8kcn4ZgJoPwiIrBOi0mkU3g8cE55LXHjyDijG38h567meb9hx0gJ-1DfGDIf0y_Pjjt5lFzZ7Zgy5MaSurSMyRoaMmzX3TdXimAUI_ldbYBIjX1pmf93qcU_7jP419VCLR1jHAf41T0afUMid1nRSU1tVZJ1Nb0WDXyU5SznvmLvJ3sSBAPIipQSNLXWGkFkVAsOmzsVS6K2vQaGnS_riIIwRM0OD8OwPaLNO6tWsQmLvC4CJY3lJl5SCkIq_9wwbbivdJNTWOaeYzoUW-ZU2Vz2pIel5OSiA-6x9Ts1_HwZbZpYAgvEDDk3qLnXAnypUwCzKMJ3ew8ctG_oTIjc74rx1tkgziJ36AppFfkpfSJgdy1L-RUfyxsNegxvKhuA6FfmNyYy_xOg8oTiolU-GQSOA.Z1fv4lvFR87xVYuG4Z5Y6w; _puid=user-3bAq5sYp5jF1ezAQV0HNPfA1:1700928675-p9qZdkzmxd1wqdBhYDKqRtngvLQFHzp%2FZc2XGfLe6nY%3D; intercom-session-dgkjq2bp=NXJnWVZiZHcrd0VkN2g0Wm5IejVQR1dnb1pvMUsxbHExR3orbVQrWit0bE96dzJZY3VEQlNjcWxqU0dIVEFZSy0tUlhQZ0VHSmhpTTA2OXJNK1NwUGV0QT09--b9541b250da92e5940a4944250190fe3d48a4f1c; _uasid="Z0FBQUFBQmxZaHl4c3VCcUZqTDJTb1lWVG9rcC03R0hLRHRJNnFmRVp5SjhLUUxPOWVRNEJjUVJkYkVPVk5VcnVvTGxQbUUwclZ1RzRFQzBSUXg3Z29vdXpieENOOHlvYzQ3NEk3NklNNFprZlJNVTVHU25JZF8wcE5Zd0ktYnJtU2tHUGpTUlVBUFRXeWNrYWFleDExSE5sWlVLLUZ2NVJCb1htTm5QUmV2T2tScmgtSDJySFRnU1hvWVE2QVhhSHZ6em80SFlZUmJTS21ydWMyZkZTYVdUQTVCY3RybUpyS3lmZ0ZEMWN5bnRBN2dkTEI3Sm4yNGg1aUEyNTBQakVFSTdlZFozRGotREtwdHNJSkRsMWpwbkhJQzI3R0MzOFhXNzNUOWRiMWtGY21fRDZucVp6dFdkby1jc1FsSGlFR0JscEQ5SW1fRm95aUIwMU9OUkZXdmg2U3drd28zYktnPT0="; _dd_s=rum=0&expire=1700930460371'
    // const cookies = readFileSync('chatgpt.token.txt', 'utf-8')
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
    const candles = await this.brokerYahoo.getCandlesFromCount({name: 'AMZN'}, '1d', 160)
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
              id: 'aaa2734b-e6c7-41b6-aac1-f1b5834532ee',
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
          arkose_token:
            '128179aea6b3a9dd6.1495712905|r=eu-west-1|meta=3|metabgclr=transparent|metaiconclr=%23757575|guitextcolor=%23000000|pk=35536E1E-65B4-4D96-9D97-6ADB7EFF8147|at=40|sup=1|rid=72|ag=101|cdn_url=https%3A%2F%2Ftcr9i.chat.openai.com%2Fcdn%2Ffc|lurl=https%3A%2F%2Faudio-eu-west-1.arkoselabs.com|surl=https%3A%2F%2Ftcr9i.chat.openai.com|smurl=https%3A%2F%2Ftcr9i.chat.openai.com%2Fcdn%2Ffc%2Fassets%2Fstyle-manager',
          conversation_id: 'c2539cfc-422d-48ce-bf99-a8ba45cb6fc9',
          parent_message_id: 'aff7d360-a820-41a1-8f12-c8c30084b596',
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
            Authorization:
              'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJkaWVjb2luQG91dGxvb2suY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy1UclQ0SEJGOE5CMlBJaUxLMTFZVlVVRHMiLCJ1c2VyX2lkIjoidXNlci0zYkFxNXNZcDVqRjFlekFRVjBITlBmQTEifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6ImF1dGgwfDYzYzZmMDM5M2Y0NzQ3YWNkNGI0YjBiMyIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MDA5MTAyMDcsImV4cCI6MTcwMTc3NDIwNywiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvcmdhbml6YXRpb24ud3JpdGUgb2ZmbGluZV9hY2Nlc3MifQ.WmP4h-jnUoVU6KDLgEMVSkQ9nxvSYYh_Pndi90_NrFqZPS-93M0GT1a8Lecl4sQHwE36l837UBUB8eP1JrcD9SWsUpzMaa88SIkM2UBMEtv2yKfq_7x8L9xzndC8tiA2fwc8zeV6l-gDq74rlvahi41yBdb8SX641fCLP8Ckc8-Zw4uHcS0XMNf0KROBiMLuxFU9lYW2dy7Wx1_GhtjmCMPx77uUgv_jex6Hkfw4CNFXR3aEahM2V_pMFX3IepRqmKh4CdRBYornjGKSmv970xRjqIzY02nXv7mmIEyoQKpRdSwmAInDr4tJfyqFFC-nsc5rGXfm4qDxhPMJaBgBSw',
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

// (async () => {
//   const result = await fetch('https://chat.openai.com/backend-api/conversation', {
//     keepalive: true,
//     referrerPolicy: 'same-origin',
//     method: 'POST',
//     redirect: 'follow', // manual, *follow, error
//     headers: {
//       "Dnt": "1",
//       "Origin": "https://chat.openai.com",
//       "Accept-Language": "en-US",
//       Accept: 'text/event-stream',
//       'Content-Type': 'application/json',
//       "Cache-Control": "no-cache",
//       "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
//       "Sec-Fetch-Site": "same-origin",
//       "Sec-Fetch-Mode": "cors",
//       "Sec-Fetch-Dest": "empty",
//       Authorization:
//         'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJkaWVjb2luQG91dGxvb2suY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy1UclQ0SEJGOE5CMlBJaUxLMTFZVlVVRHMiLCJ1c2VyX2lkIjoidXNlci0zYkFxNXNZcDVqRjFlekFRVjBITlBmQTEifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6ImF1dGgwfDYzYzZmMDM5M2Y0NzQ3YWNkNGI0YjBiMyIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MDA5MTAyMDcsImV4cCI6MTcwMTc3NDIwNywiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvcmdhbml6YXRpb24ud3JpdGUgb2ZmbGluZV9hY2Nlc3MifQ.WmP4h-jnUoVU6KDLgEMVSkQ9nxvSYYh_Pndi90_NrFqZPS-93M0GT1a8Lecl4sQHwE36l837UBUB8eP1JrcD9SWsUpzMaa88SIkM2UBMEtv2yKfq_7x8L9xzndC8tiA2fwc8zeV6l-gDq74rlvahi41yBdb8SX641fCLP8Ckc8-Zw4uHcS0XMNf0KROBiMLuxFU9lYW2dy7Wx1_GhtjmCMPx77uUgv_jex6Hkfw4CNFXR3aEahM2V_pMFX3IepRqmKh4CdRBYornjGKSmv970xRjqIzY02nXv7mmIEyoQKpRdSwmAInDr4tJfyqFFC-nsc5rGXfm4qDxhPMJaBgBSw',
//       // "Content-Type": "application/json",
//       // 'Content-Type': 'application/x-www-form-urlencoded',
//       "Cookie": 'intercom-device-id-dgkjq2bp=84c38580-3df6-4549-92ae-33723419a4fd; __stripe_mid=0fcd508c-c393-42c3-a342-987445ba47dfcfd8bb; _cfuvid=OyYFqEd0KhEfOaUdElSzM3wWzrUAqxuJJKawiMyTzLw-1700907430509-0-604800000; cf_clearance=8wt3gO3X0wllxvxIXnlqnlhjqilU90l49UytMGw13ZU-1700907431-0-1-35530993.723d5efc.530a57f6-0.2.1700907431; _cfuvid=ABhlFrpLEjuGb7wHqeZ6kH1G2g_uxCKvGSSrZBJh5GQ-1700907649253-0-604800000; cf_clearance=60DwGz7Ga0VI74LkT6uuVq0IJkXk2Q5fNc33hz_oMa4-1700907650-0-1-35530993.723d5efc.530a57f6-0.2.1700907650; __Host-next-auth.csrf-token=7f032dcacaaa797a3824c783b6279da3e2ad20c6ec848614437ad3eaa882e653%7C7fa95d35b4cfe91069fb0062650f42522c19871d2cb797f2b3c056b497680c48; ajs_user_id=user-3bAq5sYp5jF1ezAQV0HNPfA1; ajs_anonymous_id=463182bd-3a98-40a4-93fe-f8dd04f6870a; ajs_user_id=user-3bAq5sYp5jF1ezAQV0HNPfA1; _puid=user-3bAq5sYp5jF1ezAQV0HNPfA1:1700910305-ktJihx3vWpydRcLR23GMJz3uKDvcJfQZeq1U5MORshA%3D; intercom-session-dgkjq2bp=NXJnWVZiZHcrd0VkN2g0Wm5IejVQR1dnb1pvMUsxbHExR3orbVQrWit0bE96dzJZY3VEQlNjcWxqU0dIVEFZSy0tUlhQZ0VHSmhpTTA2OXJNK1NwUGV0QT09--b9541b250da92e5940a4944250190fe3d48a4f1c; __Secure-next-auth.callback-url=https%3A%2F%2Fchat.openai.com; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..2N9JfXsbdNQrc5Hh.P0blOiLFwlYchoEKUZLDTMVgTXocgVAtiVvVe3GVoZSX9PlhzH_zwCGgQDw7mfTHD7siHz5TnKBqCIg8qys4Ftna0_cpIxjgd7AUAe7f6JPNKdaEaVZRmVLp300ZMTmE5HiPtBxmq5jWKIVa4kW68wQsJWESWHwUhoGffBlMMAbh7bTdiX4Duf4GkXbXROqaR4vXL49ypMwlTYowy5vdlt5_xs6M_x1OgMFTNljjXt2UOzwt0dhcAXnyOxiLgZ2JUlFtTkDLbeIRKm3l57zaGCeGzR-HIQ589H9_DFiQa9IjS36hM27Ylr19zPMhGamKwt4mBNGf09hUPKkE6V8MoyfK6OpLOVPbIKQ-nNfTiikAh8T_ddX5cEK1cUJKHJiJAy8QYc0N-veajL8bZ9ZVmje2uhUXCg7dfOoifI_jWzJRzuDIhuZE9y0Sm_PzbQHxec2DOHGBMoEOk3blm3Yj7m7NmBvNUK241Pu6s-reWtc5Ty0FP4axPd0R41O88-zW9WFKMWZ-v8D2qmAMdBl7249DNYjSMhsFb1FkU5hvCYWa99WLAtLVRgsTJdMmQ50hUUT5SJAGqDP-T1n5RAYGQlqpfRuvgc9YAYsWgpYmL2GMVzszZIOYZApO6fd-rlvwOp9ukbSV5BOSFCzGHNaAebpdSn2yH3uEDp_orhmLVXK_8SYHsbHVg3U751PDrOFvc4FwxAGyTt71PqCI78CGCkpesrW4nRoqNzvWAfy3qvHxvo_7MxBdCNWD1rvdESceVN7EWa8mgW6na4G6mwDhM5staXmxEWVZVC9Ft32dVfKByFeFD9FAaw29PHnIBw2N8Kappk9qz9yKCa40rM5CUswCyaOJ1SLRzySVYcH2l7iHeAGPxW9_46Cocrv86BfTzyr2C5hF6ddzymBSjFKH40I6c-0thY5pyYWuF19v4i_jnDR8OX-vno3iw73JGctJv93Ncp_t5sq70k6Jtp9Kfw230rxYXQHb6gaveTZhW_84pN2_wFv8i8P2vYs96EyXTTK94YD13o9zPzUl19RMYYsM2OUF1QIq4bcTSTkcWBU38baKglWZvCSPL0xQjD7hv2EbcCTwascORmKg0_E5L4BkDI7bQtZBA1Hh3DhcBz3-Ds4_DWZjjVjViQzuAyjDmEW4E3uUogactfgRUReMgTWWKRXk35lcEjA-7NYAYM5xFILRl4V1coWM2eMH_Iakbwbr38RPr4_u23yJs3xjANhZdnUcGLykXtUlF_GG58Wzvi1yUcrvPVeSO0juDYKScaO5rVpreTerISAa1p3M66TIxfE4DzgwVKyyxx0OLHEkBES7O87jtnBL2wiG_4ofpF3ILwMgwOHD12pHv0dguFaYSeniMOsZCq7OdR28i8exuc70kaTH2zDP8Knbz_V34Y0wBnY8KEWtuL09_5AbImful_Hey5oVkrWiMhPvtKI-WiExEYha-o8voGesbTIym5omrKXdfn9RJMC23JXR2Gu528JCM52Ydzbm0eXOBPNKnR82sXb5SD6Vd7jlJzDJMJv0J_HBaz3CIQLXGQ9wMJ_cRarQwE-xtWaah9lMqOH16eXaTrLXtluhtW7YSCYe-apnp21-91xAvi_MQ4sFJh58mKT7nRxwuTrBjAor4_0zXrm4kw5qwSmMQ5-lBWKfxi3Kpidbw-Vosd5EedltWVJr9ihptQUop0TeSnbXBA7hJPbImgaa0O62VBXxZ3oscTDDdo5a08e2ucqhbS9jzoXs14EOGoZCMg9tNNEw7LuO6oUibkR0cwZ_8LzF1vwuaiWCoGypa5lazCVZcAdAwvPJIrvArRRsfPPLao71Cawg4KHR7WmGY8ss5PpSEgxc7jpJe5Beg6-9xxj6G-lDalMsCp-zWgaGMqq30rxphlGWs66J_L6vd7UJWrL0g12x2enYNtgZ7jqOFzZKQC83KGzplyJllfFyHShqW3LIVvNXViG0f8oNdQM1XKc9AVXRZqhW7OGLMiesFwnVFkiYlN4xHN7KkBN_yUhW-b_uqGip4I_g1Yuj04xyWTE11Kt19flcQ0U4h8veystmoiUYMZ4Bd11J4OhNW10jTG33cp6nk85HT5WtA_9aifphslgHYgrhSkDLSXwmuhv3Ak6rbNPG1NrToa6TxOrbGQbgL9t6Rqmj9I4mzp2nBKLjdtpkdbj6LxYOXD89AU9czTu6I8_tj6BVN57M3StnZtU0rWzIChM2W6eDZHyzQazS91VWBQ_VJfzuDtqMWR19HZGX2Dn5dzG9v62dnu7LV8Jyry2K4q5MlYuRdtSI2z02K2ITZ09-8BfGNAzqkm35WW2vlaMzG9ELAtU2K8z6r3ii9JmSgUZlDsXXmF79fKqP5anWJpfY0YD4BKQXNGGRrCqdc8wj-Ewj8dXK-lCF5MGPmRsCcHEJI9DrvVqLHkIZUZLxehLtZzfIMR7HMvp0somIaIcErdknLj21yKEVlCH8SF1L7lkUqI8aJr_47-pv0mduoVCSIEYH9ALosxUfvMGONDuveXtsohoFcgczG0171JY2XASAridTN3Age3W2IwSlUXqVO3LdbbzfJ7Yga2ZEZNh1OplpX92JRCMwm98BWLxlAES2hKHb2MnNqKCe_F0vbzXJRfbGOYEcAi03Oy7acXt-frhpMUdH53Uop4a-i7geUC3d_FD4myJg_2IPaIzykYfakvCfx3Fn7JeIiQ2OPI-hdphS0yvr49MbtpS7_9hO-uVryKTEJ2dGmkzHWsLaaPL7zSHq-66nr-DfV-LiDaf89rxuWgvdHwcTXq3Yl7eiJH3i-PBeTT4sLSQU4Q0DXddZTahFZA7LwKqj3vJdR8UtuSWMfZzSKMZSIWTiz0Lhok6Vv_oosqgYcPgg4VNeMlYUc6yeCXIg7kS5-PwEYfKmTzTVxeyt94lGRQ.o-6IrGD_NuTRkQzessRF1A; _puid=user-3bAq5sYp5jF1ezAQV0HNPfA1:1700929865-PHgaBOHSRKFMT2N2rPK58jEGeuIfvG%2B0M6Kqf%2FNeG5o%3D; __cflb=0H28vVfF4aAyg2hkHFH9CkdHRXPsfCUf5WMfsepsovu; __cf_bm=Q2cjqV4nDDLlSbrsHc76T4KFEvyGRJqBmIs0DyfUvt8-1700931542-0-AQoUN563B5bPJobId47bFDVImENdVb2fU4+eZrf2CrqpOtiiv6nlxDpewgScsXH/69qh2zQGElRVj8ZSrK7yUQY=; _uasid="Z0FBQUFBQmxZaWloZ29pNmNwZEd1d2VzbWFYdzdicFF3S1N4SWR6eENEM25SVkpQWDhteFd2aF9vMm9jVDBIaWhHUklhVnd3ZExzQUlzY0tSdHoxN1owQ1VOR1dWT3cxWk5BeDZFLUlrX292V3p6clNKZnpkS19yTG5WWU5vNUFnUDVCRzhvUkRCVjhucnBhT3A5OTZnZzZQaFJzcWU3UHhHa0NYeVBmMDVXMXh5WmM5S0h1X1pxay02Z2RmTUttbTBYOGwwdWdJOFdZSnpVZ3ZJU1BIOW9YeE9Sb2xCOUotUmhoNHFtOUk0TVJfakN5cG5lMlpuQy1ZU3UyYy00ZDIyRURlWVFKdVNoM2w4MF9HUnZ0enlQM09sRS05dS15MUlmNWlsdkl2UXhTU1M1anE3VHR5TEFLRXhYUWIyMzZxZFRidzNBcEtXazduQ2RWYm9HaG9XNU1LMHZ4bFdjd1NnPT0="; _dd_s=rum=0&expire=1700932662247',
//     },
//     body: JSON.stringify({
//       action: 'next',
//       messages: [
//         {
//           id: 'aaa2734b-e6c7-41b6-aac1-f1b5834532ee',
//           author: {
//             role: 'user',
//           },
//           content: {
//             content_type: 'text',
//             parts: ['ert'],
//           },
//           metadata: {},
//         },
//       ],
//       conversation_id: 'c2539cfc-422d-48ce-bf99-a8ba45cb6fc9',
//       parent_message_id: 'aff7d360-a820-41a1-8f12-c8c30084b596',
//       model: 'gpt-4',
//       timezone_offset_min: -60,
//       suggestions: [],
//       history_and_training_disabled: false,
//       arkose_token:
//         '128179aea6b3a9dd6.1495712905|r=eu-west-1|meta=3|metabgclr=transparent|metaiconclr=%23757575|guitextcolor=%23000000|pk=35536E1E-65B4-4D96-9D97-6ADB7EFF8147|at=40|sup=1|rid=72|ag=101|cdn_url=https%3A%2F%2Ftcr9i.chat.openai.com%2Fcdn%2Ffc|lurl=https%3A%2F%2Faudio-eu-west-1.arkoselabs.com|surl=https%3A%2F%2Ftcr9i.chat.openai.com|smurl=https%3A%2F%2Ftcr9i.chat.openai.com%2Fcdn%2Ffc%2Fassets%2Fstyle-manager',
//       conversation_mode: {
//         kind: 'primary_assistant',
//       },
//       force_paragen: false,
//       force_rate_limit: false,
//     }),
//   }) .then((response) => {
//     const reader = response.body.getReader();
//     return new ReadableStream({
//       start(controller) {
//         return pump();
//         function pump() {
//           return reader.read().then(({ done, value }) => {
//             // When no more data needs to be consumed, close the stream
//             if (done) {``
//               controller.close();
//               return;
//             }
//             // Enqueue the next data chunk into our target stream
//             console.log(3434, value.toString()) 
//             controller.enqueue(value);
//             return pump();
//           });
//         }
//       },
//     });
//   })
//   .then(async (stream) => console.log(await new Response(stream).text()))

// })()
