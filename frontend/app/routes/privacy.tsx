import type { Route } from "./+types/privacy";
import { CONTACT_EMAIL, LegalPage, LegalSection } from "~/components/legal/LegalPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy · SetupRank" },
    {
      name: "description",
      content: "What SetupRank collects, why, and what you can do about it.",
    },
  ];
}

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      seeAlso={{ to: "/terms", label: "Terms of Use" }}
      intro={
        <p>
          SetupRank is a small, independent site run from Australia. We collect
          only what’s needed to run it. We don’t sell your data, show ads or
          use analytics trackers.
        </p>
      }
    >
      <LegalSection title="What we collect">
        <ul>
          <li>
            <strong>When you sign in with Google:</strong> your Google account
            ID, email address, name and profile picture link. We also create a
            handle for your account. We never receive your Google password.
          </li>
          <li>
            <strong>When you upload a setup:</strong> the photos, setup name and
            description. Before storing photos we remove embedded metadata,
            such as GPS location and camera details.
          </li>
          <li>
            <strong>When you vote:</strong> which setup you picked in each
            battle. If you’re signed in, the vote is linked to your account. If
            not, it’s stored without any account.
          </li>
          <li>
            <strong>Saves:</strong> the setups you save, linked to your account.
          </li>
          <li>
            <strong>Reports:</strong> we only count how many times a setup was
            reported. Reports aren’t linked to you.
          </li>
          <li>
            <strong>Technical data:</strong> like any website, our servers and
            Cloudflare handle your IP address and browser details to deliver
            the site and protect it from abuse. These can appear in server
            logs.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          After you sign in we set one cookie, <strong>auth_token</strong>,
          which keeps you signed in for 7 days. A few short-lived cookies are
          used during the Google sign-in itself. Cloudflare may set cookies
          needed for security. There are no advertising or analytics cookies.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <ul>
          <li>to sign you in and show your setups and saves</li>
          <li>to run battles and calculate ratings and rankings</li>
          <li>to spot vote manipulation and remove content that breaks the rules</li>
        </ul>
        <p>We don’t send marketing emails.</p>
      </LegalSection>

      <LegalSection title="What’s public">
        <p>
          Setup photos, names, descriptions, ratings and win/loss records are
          public. Your email address, Google name and profile picture are not
          shown to other users.
        </p>
      </LegalSection>

      <LegalSection title="Who else handles your data">
        <p>We use a few services to run the site:</p>
        <ul>
          <li>
            <strong>Amazon Web Services</strong> hosts the server, the database
            and the photos (Sydney region). Photos are delivered worldwide
            through Amazon CloudFront.
          </li>
          <li>
            <strong>Cloudflare</strong> handles our domain, security and
            caching.
          </li>
          <li>
            <strong>Google</strong> handles sign-in.
          </li>
        </ul>
        <p>
          Cloudflare and CloudFront serve the site from locations around the
          world, so some data may be processed outside Australia.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your account, setups, votes and saves while your account
          exists. When you ask us to delete your account, we delete your
          account details, setups and photos, and your votes are kept only
          without any link to you. We don’t keep backups.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul>
          <li>
            To see, correct or delete your data, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the
            address you sign in with.
          </li>
          <li>
            You can remove SetupRank’s access to your Google account at any time
            in your Google Account settings, under Security.
          </li>
          <li>You can vote without signing in at all.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          SetupRank isn’t meant for children under 13, and we don’t knowingly
          collect their data.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If we change this policy, we’ll update the date at the top of this
          page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
