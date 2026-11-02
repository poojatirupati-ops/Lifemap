// Report page 9: what happens next. A photo header, the three steps, what to bring and ask.
import { PageFrame, Photo, type PageProps } from './PageFrame.tsx'

const STEPS = [
  { title: 'Share your plan', text: 'Send this guide to an expert, with your permission.' },
  { title: 'Meet your expert', text: 'They check the numbers and your details.' },
  { title: 'Agree your personal plan', text: 'Choose the steps that fit your life.' },
]

export default function NextPage(props: PageProps) {
  const { topics, checklist, questions } = props.data.next
  return (
    <PageFrame
      {...props}
      label="Share with an expert"
      hero={
        <div className="lmr-n9">
          <div className="lmx-ph">
            <Photo name="team-with-charts" />
          </div>
          <div className="lmx-tx">
            <div className="lmx-ey">WHAT HAPPENS NEXT</div>
            <h1 className="lmx-tt">Share your plan with an expert</h1>
            <p className="lmx-ld">
              This guide is a starting point. An expert can confirm it, answer your questions and
              help you choose what to do.
            </p>
            <span className="lmx-bt">Meet an expert in the app</span>
          </div>
        </div>
      }
    >
      <div className="lmr-body lmr-body9" style={{ paddingTop: 0 }}>
        <div className="lmr-steps">
          {STEPS.map((step, index) => (
            <div key={step.title}>
              <span className="lmx-n">{index + 1}</span>
              <div>
                <div className="lmx-t">{step.title}</div>
                <div className="lmx-x">{step.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="lmr-two9">
          <div>
            <div className="lmr-h3">An expert can help with</div>
            <div className="lmr-tchips">
              {topics.chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="lmr-h3">Before you meet</div>
            {checklist.items.map((item) => (
              <div className="lmr-ck" key={item}>
                <i></i>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          <div className="lmr-h3">Questions to ask</div>
          <div className="lmr-qs">
            {questions.items.map((question) => (
              <div key={question}>{question}</div>
            ))}
          </div>
        </div>
        <div className="lmr-sp"></div>
        <div className="lmr-banner" style={{ marginTop: 0 }}>
          <div>
            <div className="lmx-t">Ready when you are</div>
            <div className="lmx-x">Your plan stays private until you choose to share it.</div>
          </div>
          <span className="lmr-btn">Meet an expert</span>
        </div>
      </div>
    </PageFrame>
  )
}
