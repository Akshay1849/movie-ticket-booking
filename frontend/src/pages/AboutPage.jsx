import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="about-page page-shell">
      <section className="about-hero">
        <span className="eyebrow">About Vasundhara Theatre</span>
        <h1>Your local cinema experience, made simple.</h1>
        <p>
          Vasundhara Theatre 70MM is a single-screen theatre experience in
          Bhongir, bringing movies, comfortable seating, and convenient ticket
          booking together in one place.
        </p>
      </section>

      <section className="about-content">
        <div className="about-card">
          <span className="eyebrow">Our Theatre</span>
          <h2>Vasundhara Theatre 70MM</h2>
          <p>
            Vasundhara Theatre is a single-screen cinema with a total seating
            capacity of 721 seats across Balcony, First Class, Second class sections.
          </p>
        </div>

        <div className="about-card">
          <span className="eyebrow">Seating</span>
          <h2>721 Seats</h2>
          <p>
            Choose from 186 Balcony seats, 390 First Class seats and 145 Second class seats while
            booking your favourite show.
          </p>
        </div>

        <div className="about-card">
          <span className="eyebrow">Easy Booking</span>
          <h2>Book in a few steps</h2>
          <p>
            Browse movies, choose a show, select your seats, and keep your
            booking details available from your account.
          </p>
        </div>

        <div className="about-card">
          <span className="eyebrow">Our Platform</span>
          <h2>Built for a better experience</h2>
          <p>
            This platform provides movie discovery, real-time seat
            availability, booking history, ticket details, and secure
            customer accounts.
          </p>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to watch a movie?</h2>
        <p>Explore the latest movies and find your next show.</p>

        <Link className="button" to="/">
          Browse movies <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}