#!/usr/bin/env node
/**
 * Recomprime, no lugar, as fotos já existentes no bucket `product-images`
 * (uploads feitos antes da compressão no Admin passar a rodar no navegador).
 * Sobrescreve o mesmo path -> a coluna imageUrl no banco não muda.
 *
 * Requer a Service Role Key (bypassa RLS; a policy pública só permite
 * INSERT autenticado, não UPDATE). NUNCA commitar essa chave.
 *
 * Uso:
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/recompress-images.mjs [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const BUCKET = 'product-images';
const PREFIX = 'mivie';
// Só recomprime o que ainda vale a pena; evita reprocessar o que o próprio
// script já otimizou numa execução anterior.
const SIZE_THRESHOLD_BYTES = 400 * 1024;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.argv.includes('--dry-run');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (Dashboard > Project Settings > API).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const maxDimensionFor = (name) => (name.startsWith('hero_') ? 1920 : 1600);

async function main() {
  const { data: files, error } = await supabase.storage.from(BUCKET).list(PREFIX, { limit: 1000 });
  if (error) {
    console.error('Erro ao listar arquivos:', error.message);
    process.exit(1);
  }

  console.log(`${files.length} arquivo(s) encontrados em ${BUCKET}/${PREFIX}`);

  let processed = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const file of files) {
    const path = `${PREFIX}/${file.name}`;
    const originalSize = file.metadata?.size ?? 0;

    if (originalSize > 0 && originalSize <= SIZE_THRESHOLD_BYTES) {
      skipped += 1;
      continue;
    }

    const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(path);
    if (downloadError || !blob) {
      console.warn(`  ! falhou ao baixar ${path}: ${downloadError?.message}`);
      continue;
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const maxDimension = maxDimensionFor(file.name);

    const output = await sharp(buffer)
      .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    if (output.length >= buffer.length) {
      skipped += 1;
      continue;
    }

    const reduction = (((buffer.length - output.length) / buffer.length) * 100).toFixed(0);
    console.log(`  ${path}: ${(buffer.length / 1024).toFixed(0)}KB -> ${(output.length / 1024).toFixed(0)}KB (-${reduction}%)`);
    savedBytes += buffer.length - output.length;
    processed += 1;

    if (!dryRun) {
      const { error: uploadError } = await supabase.storage.from(BUCKET).update(path, output, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true,
      });
      if (uploadError) {
        console.warn(`  ! falhou ao sobrescrever ${path}: ${uploadError.message}`);
      }
    }
  }

  console.log(
    `\n${dryRun ? '[dry-run] ' : ''}${processed} recomprimido(s), ${skipped} já ok. Economia: ${(savedBytes / 1024 / 1024).toFixed(1)}MB.`
  );
}

main();
