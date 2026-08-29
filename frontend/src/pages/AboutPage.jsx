import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="about-page page-shell">
      <section className="about-hero">
        <span className="eyebrow">About Vasundhara Theatre</span>

        <h1>Vasundhara Theatre 70MM</h1>

        <p>
          A part of Bhongir's movie culture since 1994. Experience movies on
          the big screen with comfortable seating and a theatre loved by
          generations.
        </p>
      </section>

      <section className="about-content">
        <div className="about-card">
          <span className="eyebrow">Our Story</span>

          <h2>A Theatre with a Legacy</h2>

          <p>
            Vasundhara Theatre 70MM is a historic cinema theatre located in
            Bhongir, Telangana. Established in 1994, the theatre was
            inaugurated by Superstar Nagarjuna with the movie Brothers.
          </p>

          <p>
            Since then, Vasundhara Theatre has provided cinematic experiences
            to generations of movie lovers and continues to be part of
            Bhongir's movie culture.
          </p>
        </div>

        <div className="about-card">
          <span className="eyebrow">Theatre</span>

          <h2>70MM Big Screen</h2>

          <p>
            Enjoy an immersive big-screen movie experience at Vasundhara
            Theatre 70MM, located opposite the Old Police Station in Bhongir.
          </p>
        </div>

        <div className="about-card">
          <span className="eyebrow">Seating</span>

          <h2>576 Seats</h2>

          <p>
            Our current booking system supports 576 seats, including 186
            Balcony seats and 390 First Class seats.
          </p>
        </div>

        <div className="about-card">
          <span className="eyebrow">The Experience</span>

          <h2>Movies for Everyone</h2>

          <p>
            Enjoy a variety of movies across action, comedy, romance, and
            family entertainment, with a focus on a comfortable and enjoyable
            cinema experience.
          </p>
        </div>
      </section>

      <section className="about-content">
        <div className="about-card">
          <span className="eyebrow">Established</span>
          <h2>1994</h2>
          <p>
            A long-standing cinema destination serving movie lovers in
            Bhongir.
          </p>
        </div>

        <div className="about-card">
          <span className="eyebrow">Location</span>
          <h2>Bhongir, Telangana</h2>
          <p>
            Opposite the Old Police Station, Bhongir, Telangana.
          </p>

          <a
            className="button"
            href="https://www.google.com/maps?q=17.5105308,78.8886513"
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to watch a movie?</h2>

        <p>
          Explore the latest movies, choose your show, and book your seats.
        </p>

        <Link className="button" to="/">
          Browse movies <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}