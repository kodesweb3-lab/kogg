import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';

export default function LorePage() {
  return (
    <Page>
      <div className="min-h-screen bg-ritual-bg text-gray-100 py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-ritual-amber-400">
              The Kogainon Mountain
            </h1>
            <p className="text-xl text-gray-300 font-body">
              Where tokens ascend and packs form
            </p>
          </motion.div>

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 text-lg font-body leading-relaxed text-gray-300"
          >
            <p>
              In ancient Dacia, the Kogainon mountain stood as a sacred peak—a place where
              warriors ascended to prove their worth. The wolf, guardian of the mountain,
              watched over each climb. Those who reached the summit joined the pack.
            </p>

            <p>
              On Solana, Kogaion is that mountain. The Dynamic Bonding Curve is the path.
              Each token launch is a ritual—a summoning. Traders who buy become part of the
              pack. The ascent begins.
            </p>

            <div className="bg-ritual-bgElevated p-6 rounded-lg border border-ritual-amber-500/20 my-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-ritual-amber-400">
                The Mapping
              </h2>
              <ul className="space-y-4">
                <li>
                  <strong className="text-ritual-amber-400">Mountain = Curve</strong>
                  <br />
                  The bonding curve is the path. Price moves as traders join. Each step
                  is progress.
                </li>
                <li>
                  <strong className="text-ritual-amber-400">Ascent = Progress</strong>
                  <br />
                  Market cap grows. Holders accumulate. The token climbs higher.
                </li>
                <li>
                  <strong className="text-ritual-amber-400">Pack = Holders</strong>
                  <br />
                  Every trader who buys joins the pack. Together, they push the token
                  toward graduation.
                </li>
                <li>
                  <strong className="text-ritual-amber-400">Graduation = DAMM v2</strong>
                  <br />
                  When conditions are met, the token graduates to permanent liquidity.
                  The summit is reached. The ritual is complete.
                </li>
              </ul>
            </div>

            <p>
              Kogaion is not just a launchpad. It's a ritual. A journey. An ascent.
              Every token that launches here begins a climb. Every holder joins the pack.
              Every graduation marks a new peak conquered.
            </p>

            <p className="text-ritual-amber-400 font-heading text-xl mt-12">
              Summon your token. Begin the ritual. Ascend the mountain.
            </p>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
