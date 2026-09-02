const BRIQUEGO_CAPTURE_URL = "https://brique-sable.vercel.app/oportunidades/nova";
let capturedListing = null;

const captureButton = document.querySelector("#capture");
const sendButton = document.querySelector("#send");
const statusElement = document.querySelector("#status");
const previewElement = document.querySelector("#preview");

function setStatus(message, error = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("error", error);
}

function renderPreview(listing) {
  document.querySelector("#source").textContent = listing.source;
  document.querySelector("#title").textContent = listing.title || "Título não identificado";
  document.querySelector("#price").textContent = listing.price ? `R$ ${listing.price}` : "Preço não identificado";
  document.querySelector("#location").textContent = listing.location || "Localização não identificada";

  const photo = document.querySelector("#photo");
  if (listing.imageUrl) {
    photo.src = listing.imageUrl;
    photo.hidden = false;
  } else {
    photo.removeAttribute("src");
    photo.hidden = true;
  }
  previewElement.hidden = false;
}

function extractListingFromPage() {
  const clean = (value, max = 1000) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  const meta = (selector) => clean(document.querySelector(selector)?.getAttribute("content"));
  const visible = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
  };
  const textOf = (selectors) => {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && visible(element)) {
        const value = clean(element.getAttribute("aria-label") || element.textContent);
        if (value) return value;
      }
    }
    return "";
  };
  const walkJson = (node, results = []) => {
    if (!node || typeof node !== "object") return results;
    if (Array.isArray(node)) {
      node.forEach((item) => walkJson(item, results));
      return results;
    }
    const type = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    if (type.some((value) => ["Product", "Offer", "Vehicle"].includes(value))) results.push(node);
    Object.values(node).forEach((value) => walkJson(value, results));
    return results;
  };
  const jsonItems = [];
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try { walkJson(JSON.parse(script.textContent || "null"), jsonItems); } catch { /* anúncio sem JSON estruturado */ }
  }
  const product = jsonItems.find((item) => item["@type"] === "Product" || item["@type"] === "Vehicle") || jsonItems[0] || {};
  const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers || jsonItems.find((item) => item["@type"] === "Offer") || {};

  const host = location.hostname.toLowerCase();
  const source = host.includes("facebook.com")
    ? "Facebook Marketplace"
    : host.includes("olx.com.br")
      ? "OLX"
      : host.includes("mercadolivre.com.br") || host.includes("mercadolibre.com")
        ? "Mercado Livre"
        : "Outra";

  let title = clean(product.name || meta('meta[property="og:title"]') || textOf(["h1"]), 120);
  title = title.replace(/\s*[|·-]\s*(Facebook Marketplace|Facebook|OLX|Mercado Livre).*$/i, "").trim();

  const titleElement = document.querySelector("h1");
  let nearbyText = "";
  let ancestor = titleElement;
  for (let index = 0; ancestor && index < 6; index += 1, ancestor = ancestor.parentElement) {
    const value = clean(ancestor.textContent, 4000);
    if (/R\$\s*[\d.]+(?:,\d{2})?/.test(value)) { nearbyText = value; break; }
  }
  const priceText = clean(
    offer.price ||
    meta('meta[property="product:price:amount"]') ||
    textOf([
      ".ui-pdp-price__second-line .andes-money-amount",
      "[data-testid='ad-price']",
      "[data-testid='price-value']",
      "[itemprop='price']"
    ]) ||
    nearbyText.match(/R\$\s*[\d.]+(?:,\d{2})?/)?.[0] ||
    clean(document.body.innerText, 20000).match(/R\$\s*[\d.]+(?:,\d{2})?/)?.[0]
  );
  const normalizePrice = (raw) => {
    const value = clean(raw).replace(/^R\$\s*/i, "").replace(/\s*reais.*$/i, "").trim();
    if (!value) return "";
    if (/^\d+(?:\.\d{1,2})?$/.test(value) && !/^\d{1,3}\.\d{3}$/.test(value)) {
      return Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    const digits = value.replace(/[^\d,.]/g, "");
    const number = Number(digits.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(number) ? number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
  };

  const description = clean(product.description || meta('meta[property="og:description"]') || meta('meta[name="description"]'), 1000);
  const imageCandidate = Array.isArray(product.image) ? product.image[0] : product.image;
  const imageUrl = clean(typeof imageCandidate === "object" ? imageCandidate?.url : imageCandidate || meta('meta[property="og:image"]'), 1500);
  const locationText = textOf([
    "[data-testid='location-date']",
    "[data-testid='ad-location']",
    ".ui-pdp-media__title",
    "[class*='location']"
  ]);

  return {
    source,
    title,
    price: normalizePrice(priceText),
    location: clean(locationText, 120),
    description,
    imageUrl: /^https?:\/\//i.test(imageUrl) ? imageUrl : "",
    originalUrl: location.href.slice(0, 1800)
  };
}

captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  previewElement.hidden = true;
  setStatus("Lendo os dados visíveis do anúncio…");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:\/\//i.test(tab.url || "")) throw new Error("Abra primeiro a página de um anúncio.");
    const [execution] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractListingFromPage });
    capturedListing = execution?.result;
    if (!capturedListing) throw new Error("Não foi possível ler esta página.");
    renderPreview(capturedListing);
    setStatus(capturedListing.price ? "Anúncio encontrado. Confira e envie." : "Anúncio encontrado; confirme o preço no BriqueGO.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Não foi possível capturar o anúncio.", true);
  } finally {
    captureButton.disabled = false;
  }
});

sendButton.addEventListener("click", async () => {
  if (!capturedListing) return;
  const target = new URL(BRIQUEGO_CAPTURE_URL);
  target.searchParams.set("captured", "1");
  for (const [key, value] of Object.entries(capturedListing)) {
    if (value) target.searchParams.set(key, value);
  }
  await chrome.tabs.create({ url: target.toString() });
  window.close();
});
