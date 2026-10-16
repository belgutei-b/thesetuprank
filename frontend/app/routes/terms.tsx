import type { Route } from "./+types/terms";
import { CONTACT_EMAIL, LegalPage, LegalSection } from "~/components/legal/LegalPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms of Use · SetupRank" },
    { name: "description", content: "The rules for using SetupRank." },
  ];
}

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      seeAlso={{ to: "/privacy", label: "Privacy Policy" }}
      intro={
        <p>
          SetupRank (thesetuprank.com) is a small, independent site where people
          vote on desk setups head-to-head. By using it, whether you’re voting,
          signing in or uploading a setup, you agree to these terms. If you
          don’t agree, please don’t use the site.
        </p>
      }
    >
      <LegalSection title="Your account">
        <ul>
          <li>You sign in with your Google account. We never see your Google password.</li>
          <li>
            You need to be at least 13, or the minimum age to have a Google
            Account where you live.
          </li>
          <li>One account per person. You’re responsible for what happens under your account.</li>
          <li>You can vote without an account. Uploading and saving setups need one.</li>
        </ul>
      </LegalSection>

      <LegalSection title="What you can upload">
        <p>Only upload setups that are yours. Every upload must:</p>
        <ul>
          <li>be a photo you took of your own desk setup</li>
          <li>
            not show anyone’s private information, such as documents, emails,
            addresses or screens with personal details
          </li>
          <li>
            not contain nudity, hate symbols, violence or anything illegal
          </li>
          <li>not be an ad: no store watermarks, promo codes or links</li>
        </ul>
      </LegalSection>

      <LegalSection title="Your photos stay yours">
        <p>
          You keep ownership of everything you upload. By uploading, you give
          SetupRank a free, non-exclusive, worldwide licence to store, resize,
          convert and display your photos, setup name and description on the
          site: in battles, rankings and other parts of SetupRank. This licence
          ends when your setup is removed.
        </p>
        <p>
          When you upload, we resize and convert your photos and remove
          embedded metadata, such as GPS location.
        </p>
      </LegalSection>

      <LegalSection title="Fair voting">
        <p>
          Rankings only mean something if votes are real. Don’t use bots,
          scripts, multiple accounts or anything else to inflate or sink a
          setup’s rating. We may discard votes or remove setups that look
          manipulated.
        </p>
      </LegalSection>

      <LegalSection title="Reports and removal">
        <p>
          Anyone can report a setup. We may remove any setup, or suspend any
          account, that breaks these terms or that we think harms the site or
          its users. We don’t have to give notice first.
        </p>
        <p>
          To remove one of your setups or your whole account, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the
          address you sign in with.
        </p>
      </LegalSection>

      <LegalSection title="No guarantees">
        <p>
          SetupRank is a personal project, provided as is. It may change, go
          offline or stop running at any time. We don’t keep backups, so keep
          your own copies of your photos.
        </p>
        <p>
          To the extent the law allows, we aren’t liable for any loss that
          comes from using the site. Nothing in these terms limits rights you
          have under the Australian Consumer Law that can’t be excluded.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms. When we do, we’ll change the date at the
          top of this page. Using the site after a change means you accept the
          new terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
