const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 4; // širina Canvasa - vidljivi rub
canvas.height = window.innerHeight - 4; // visina Canvasa - vidljivi rub

document.addEventListener("keydown", pritisakTipke); // eventListener za pritisak na tipku
document.addEventListener("keyup", pustanjeTipke); // eventListener za puštanje tipke
const igrajPonovoGumb = document.getElementById("playAgainBtn");
const startGumb = document.getElementById("startGameBtn");

let brojRedakaCigli = null;
let brojStupacaCigli = null;
let brojBodova = 0;
let highscore = localStorage.getItem("highscore") || 0;
let pritisnutaDesna = false;
let pritisnutaLijeva = false;
let igraAktivna = true;
let ishodIgre = null;
let cigle = [];

const sudarZvuk = new Audio('../pop-sound-effect.mp3');
const pobjedaZvuk = new Audio('../goodresult.mp3');
const gameOverZvuk = new Audio('../game-over.mp3');

/* 
funkcija za inicijaliziranje i pokretanje igre
*/
function pokreniIgru() {
    brojRedakaCigli = parseInt(document.getElementById("brojRedaka").value); // dohvacanje odabranog broja readaka
    brojStupacaCigli = parseInt(document.getElementById("brojStupaca").value); // dohvacanje broja stupaca

    document.getElementById("centerDiv").style.display = "none";
    canvas.style.display = "block";

    stvoriCigle(); // crtanje svih cigli
    nasumicanIzbacaj(); // izbacaj loptice u nasumicnom smjeru
    zovi(); // Pokretanje animacije
}

startGumb.addEventListener("click", pokreniIgru);

/* 
Objekt za lopticu
- zadaje se pocetni polozaj (koordinate x i y) da se loptica nalazi na sredini malo iznad palice
- zadaje se radius loptice
- zadaje se njena brzina
- zadaje se horizontalna komponenta brzine dx
- zadaje se vertikalna komponenta brzine dy
*/
const lopta = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 8,
    brzina: 7,
    dx: 0,
    dy: 0
};
/*
Funkcija za postavljanje nasumicne pocetne kretnje loptice
*/
function nasumicanIzbacaj() {
    const nasumicanKut = Math.random() * (Math.PI / 3) + (Math.PI / 6); // generira se nasumicni kut između 30 i 60 stupnjeva
    const smjer = Math.random() > 0.5 ? 1 : -1; // nasumicno se bira hoce li loptica ici lijevo ili desno
    lopta.dx = lopta.brzina * Math.cos(nasumicanKut) * smjer; // Izračun horizontalne komponente, množenje s 1 ili -1 za odabir smjera
    lopta.dy = -lopta.brzina * Math.sin(nasumicanKut); // Vertikalna komponenta, uvijek prema gore zato je negativna
}
/*
Objekt za palicu
- zadaje se pocetni polozaj (koordinate x i y) da se palica nalazi na srednini pri dnu, potpuno centrirana
- zadaje se širina
- zadaje se visina
- zadaje se brzina palice
- zadaje se horizontalna komponenta njene brzine - dx
*/
const palica = {
    x: canvas.width / 2 - 110 / 2,
    y: canvas.height - 30,
    w: 110,
    h: 15,
    brzina: 8,
    dx: 0
}

const horizontalniRazmak = 10; // Razmak između cigli
const vertikalniRazmak = 10; // Razmak između redaka cigli

/*
Objekt za ciglu
- samo se inicijalizira početna širina na 0, poslije se mijenja vrijednost
- zadaje se visina
- zadaje se bool varijabla za provjeru vidljivosti cigle
*/
const cigla = {
    w: 0,
    h: 30,
    vidljivost: true
};

/*
Funkcija za stvaranje i crtanje cigli
*/
function stvoriCigle() {
    /*
    širina pojedine cigle:
        od ukupnog mogućeg prostora na Canvasu (cijela širina minus 4 radi obruba) 
        oduzima se vrijednost svih razmaka 
        (ima jedan manje razmak od broja stupaca) te se djeli 
        brojem stupaca kako bi se ravnomjerno rasporedile cigle
    */
    cigla.w = (canvas.width - 4 - (brojStupacaCigli - 1) * horizontalniRazmak) / brojStupacaCigli;

    const ukupnaSirinaCigli = (cigla.w * brojStupacaCigli) + (horizontalniRazmak * (brojStupacaCigli - 1)); // širina svih cigli zajedno s razmacima
    const razmakX = (canvas.width - ukupnaSirinaCigli) / 2;
    /* Izračun razmaka s lijeve strane za centriranje svake cigle, dobije se ukupni prostor koji ostane na Canvasu 
    nakon crtanja svih cigli te se on dijeli s 2 kako bi se moglo pomaknuti svaku cilu za tu vrijednost i 
    efektivno centrirati cijeli redak*/

    // for petlja za dodavanje svih cigli u listu cigli
    cigle = [];
    for (let i = 0; i < brojRedakaCigli; i++) {
        cigle[i] = [];
        for (let j = 0; j < brojStupacaCigli; j++) {
            const x = j * (cigla.w + horizontalniRazmak) + razmakX; // računanje x koordinate za svaku ciglu u iteraciji - 
            const y = i * (cigla.h + vertikalniRazmak) + 60; // računanje y koordinate za svaku ciglu u iteraciji, 60 je fiksni razmak od vrha Canvasa
            cigle[i][j] = { x, y, ...cigla }; // dodavanje novih x i y vrijednosti, uz defaultne vrijednosti za širinu, visinu i vidljivost cigle
        }
    }
}
// fja za crtanje objekta lopte
function nacrajLoptu() {
    ctx.beginPath(); // pokretanje novog patha na Canvasu - početak crtanja lopte
    ctx.arc(lopta.x, lopta.y, lopta.radius, 0, Math.PI * 2); // crtanje kruga s parametrima zadanim u objektu lopte
    ctx.fillStyle = '#e78f01'; // nijansa boje za popunu
    ctx.fill(); // popuna oblika bojom
    ctx.closePath(); // zatvaranje patha na Canvasu - prestanak crtanja
}

// fja za crtanje objekta palice
function nacrtajPalicu() {
    ctx.beginPath(); // pokretanje novog patha na Canvasu - početak crtanja palice
    ctx.rect(palica.x, palica.y, palica.w, palica.h); // crtanje pravokutnika s parametrima u objektu palice
    ctx.fillStyle = "#f61e17"; // nijansa boje za popunu
    ctx.shadowColor = "black"; // nijansa boje za sjenu
    ctx.shadowBlur = 5; // količina zamućenja sjene
    ctx.fill(); // popuna pravokutnika
    ctx.shadowColor = "transparent"; // onemogućavanje sjene
    ctx.shadowBlur = 0; // onemogućavanje zamućenja sjene
    ctx.closePath(); // zatvaranje patha na Canvasu - prestanak crtanja
}

// fja za crtanje svih cigli, prolazak po listi cigli i crtanje
function nacrtajCigle() {
    for (let i = 0; i < brojRedakaCigli; i++) {
        for (let j = 0; j < brojStupacaCigli; j++) {
            let ciglica = cigle[i][j];
            if (ciglica.vidljivost === true) { // ako vrijedi da je cigla vidljiva, crtamo ju
                const ciglaX = ciglica.x; // zadavanje x koordinate
                const ciglaY = ciglica.y; // zadavanje y koordinate
                ctx.fillStyle = "#e78f01"; // nijansa boje za popunu
                ctx.shadowColor = "black"; // nijansa boje za sjenu
                ctx.shadowBlur = 5; // količina zamućenja sjene
                ctx.fillRect(ciglaX, ciglaY, cigla.w, cigla.h); // popuna pravokutnika s parametrima za trenutnu ciglu
                ctx.shadowColor = "transparent"; // onemogućavanje sjene
                ctx.shadowBlur = 0; // onemogućavanje zamućenja sjene
            }
        }
    }
}

// fja za detekciju pritiska na lijevu/desnu tipku
function pritisakTipke(dogadaj) {
    if (dogadaj.key === "ArrowRight") {
        pritisnutaDesna = true;
    } else if (dogadaj.key === "ArrowLeft") {
        pritisnutaLijeva = true;
    }
}

// fja za detekciju puštanja lijevu/desnu tipke
function pustanjeTipke(dogadaj) {
    if (dogadaj.key === "ArrowRight") {
        pritisnutaDesna = false;
    } else if (dogadaj.key === "ArrowLeft") {
        pritisnutaLijeva = false;
    }
}

// fja za detekciju kolizija loptice s ciglama
function detekcijaKolizije() {
    for (let i = 0; i < brojRedakaCigli; i++) {
        for (let j = 0; j < brojStupacaCigli; j++) {
            let ciglica = cigle[i][j];
            if (ciglica.vidljivost === true) { // ako cigla nije uništena
                if (lopta.x + lopta.radius > ciglica.x && lopta.x - lopta.radius < ciglica.x + cigla.w
                    && lopta.y + lopta.radius > ciglica.y && lopta.y - lopta.radius < ciglica.y + cigla.h) {
                    /* Provjera je li:  desna strana lopte prošla lijevu stranu cigle
                                        lijeva strana lopte prošla desnu stranu cigle
                                        donja strana lopte prošla gornju stranu cigle
                                        gornja strana lopte prošla donju stranu cigle
                    */
                    lopta.dy = -lopta.dy; // promjena vertikalne komponente brzine loptice
                    ciglica.vidljivost = false; // cigla je uništena
                    brojBodova++; // povećavanje broja bodova

                    pokreniSudarZvuk(); // pokretanje zvuka za koliziju

                    if (brojBodova > highscore) { // ako je trenutni broj bodova veći od highscore-a, spremamo novi highscore u LocalStorage
                        highscore = brojBodova;
                        localStorage.setItem("highscore", highscore);
                    }

                    if (brojBodova === brojRedakaCigli * brojStupacaCigli) { // ako su uništene sve cigle, igrač je pobjedio
                        ishodIgre = "pobjeda";
                        igraAktivna = false;

                        pobjedaZvuk.currentTime = 0;
                        pobjedaZvuk.play(); // puštanje zvuka za pobjedu
                    }
                }
            }
        }
    }
}

function kretanjePalice() {
    if (pritisnutaDesna && palica.x < canvas.width - palica.w - 2) { // ako je stisnuta desna strelica i palica nije došla do ruba Canvasa na desnoj strani, miči palicu u desno
        palica.x += palica.brzina;
    } else if (pritisnutaLijeva && palica.x > 2) { // ako je stisnuta lijeva strelica i palica nije došla do ruba Canvasa na lijevoj strani, miči palicu u lijevo
        palica.x -= palica.brzina;
    }
}

// fja za pokretanje zvuka za koliziju
function pokreniSudarZvuk() {
    sudarZvuk.currentTime = 0;
    sudarZvuk.play();
}

// fja za implementiranje logike za kretnju loptice
function kretanjeLopte() {
    if (!igraAktivna) return; // ako je igra završila prekini kretnju loptice

    lopta.x += lopta.dx; // konstantno micanje loptice u horizontalnom smjeru
    lopta.y += lopta.dy; // konstantno micanje loptice u vertikalnom smjeru


    if (lopta.x + lopta.radius > (canvas.width - 2) || lopta.x - lopta.radius < 2) { // ako je desni rub loptice prešao desnu granicu Canvasa ILI ako je lijevi rub lopte prešao lijevu granicu ekrana, odbij lopticu
        lopta.dx = -lopta.dx; // promjena horizontalne komponente brzine

        pokreniSudarZvuk(); // zvuk kolizija
    }


    if (lopta.y - lopta.radius < 2) { // ako loptica udara u gornju stranu Canvasa, odbij ju
        lopta.dy = -lopta.dy; // promjena vertikalne komponente brzine
        pokreniSudarZvuk(); // zvuk kolizija
    }

    else if (lopta.y + lopta.radius >= palica.y &&
        lopta.x > palica.x && lopta.x < palica.x + palica.w) { // ako je donji rub loptice došao do gornjeg ruba palice && provjera je li horizontalna pozicija loptice unutar granice palice

        lopta.dy = -lopta.dy; // ako sudar, loptica se odbija prema gore
        lopta.y = palica.y - lopta.radius; // podešavanje pozicije loptice da ne prolazi kroz palicu

        // dodavanje laganog spina (mala promjena smjera prilikom sudara loptice i palice da korisnik može potencijalno gađati ciljane cigle)
        if (pritisnutaDesna && !pritisnutaLijeva) { // ako je pritisnuta desna strelica, povećava se horizontalna komponenta brzine
            lopta.dx += 2;
        } else if (pritisnutaLijeva && !pritisnutaDesna) { // ako je pritisnuta lijeva strelica, smanjuje se horizontalna komponenta brzine
            lopta.dx -= 2;
        }

        // normalizacija brzine koja osigurava da je brzina loptice konstantna nakon sudara s palicom
        const brzina = lopta.brzina;
        const ukBrzina = Math.sqrt(lopta.dx * lopta.dx + lopta.dy * lopta.dy);
        lopta.dx = (lopta.dx / ukBrzina) * brzina;
        lopta.dy = (lopta.dy / ukBrzina) * brzina;

        pokreniSudarZvuk();
    }

    else if (lopta.y + lopta.radius > canvas.height) { // ako loptica udara u podnožje Canvasa, kraj igre
        ishodIgre = "poraz";
        igraAktivna = false;

        gameOverZvuk.currentTime = 0;
        gameOverZvuk.play();
    }
}

// fja za prikaz poruke ovisno o ishodu igre
function prikaziPoruku() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Očisti ekran

    ctx.font = "50px Arial"; // postavljanje fonta teksta
    ctx.fillStyle = "#FFFFFF"; // boja teksta
    ctx.textAlign = "center"; // poravnanje teksta u sredinu horizontalno
    ctx.textBaseline = "middle"; // poravnanje teksta u sredinu vertikalno

    if (ishodIgre === "pobjeda") { // ako je došlo do pobjede prikazuje se natpis Pobijedili ste na određenom mjestu na Canvasu
        ctx.fillText("Pobijedili ste!", canvas.width / 2, canvas.height / 2 - 30);
    } else if (ishodIgre === "poraz") { // ako je došlo do poraza prikazuje se natpis GAME OVER na određenom mjestu na Canvasu
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
    }

    // Prikaz bodova i highscore-a
    ctx.font = "30px Arial"; // font i veličina
    ctx.fillText("Bodovi: " + brojBodova, canvas.width / 2, canvas.height / 2 + 20); // ispis i pozicija za bodove
    ctx.fillText("HighScore: " + highscore, canvas.width / 2, canvas.height / 2 + 60); // ispis i pozicija za highscore

    igrajPonovoGumb.style.display = "block"; // prikaz gumba za ponovno igranje
}

igrajPonovoGumb.addEventListener("click", function () {
    location.reload(); // kada se stisne na gumnb za ponovno igranje, refresha se stranica
});

function nacrtajSve() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // očisti ekran
    nacrtajCigle(); // nactraj sve cigle
    nacrajLoptu(); // nacrtaj loptu
    nacrtajPalicu(); // nacrtaj palicu

    ctx.font = "20px Arial"; // veličina i font za tekst
    ctx.fillStyle = "#FFFFFF"; // boja teksta
    ctx.fillText("Bodovi: " + brojBodova, canvas.width - 140, 50); // ispis i pozicija za bodove
    ctx.fillText("HighScore: " + highscore, canvas.width - 140, 25); // ispis i pozicija za highscore
}

function zovi() {
    if (!igraAktivna) { // ako je igra gotova prikaži adekvatnu poruku i prekini animacije
        prikaziPoruku();
        return;
    }
    detekcijaKolizije(); // napravi detekciju kolizije loptice i cigli
    kretanjePalice(); // napravi provjeru za kretanje palice i pomakni palicu ako moraš
    kretanjeLopte(); // ažuriraj poziciju loptice

    nacrtajSve(); // nacrtaj sve elemente igre
    requestAnimationFrame(zovi); // zove same sebe kontinuirano i stvara dojam animacije
}