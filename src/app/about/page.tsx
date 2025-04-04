"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-6">
          關於我們
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          彼岸媒體是一家專注於創新藝術和媒體體驗的公司，致力於探索藝術與技術的交匯點。
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative h-[500px] w-full rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1508186225823-0963cf9ab0de?q=80&w=1000"
              alt="楊毅"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold">楊毅，創始人與藝術家</h2>
          <p className="text-lg text-muted-foreground">
            楊毅是一位富有遠見的藝術家，也是彼岸媒體的創始人，致力於推動當代藝術和數位媒體的邊界。
          </p>
          <p className="text-lg text-muted-foreground">
            擁有超過15年的多學科藝術經驗，楊毅的作品探索了傳統藝術形式與尖端技術的交匯點。
          </p>
          <p className="text-lg text-muted-foreground">
            楊毅出生於中國，接受了國際教育，將東方哲學概念與西方藝術技術相結合，為每件創作帶來獨特的文化視角。
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-24 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-lg rounded-3xl p-8 border border-primary/10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">我們的使命</h2>
        <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto">
          我們的使命是通過創新和技術，將藝術帶入新的高度。我們相信藝術可以啟發、教育並改變世界。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-24 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-lg rounded-3xl p-8 border border-primary/10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">我們的願景</h2>
        <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto">
          我們的願景是成為藝術與媒體創新的領導者，為全球觀眾創造令人難忘的體驗。
        </p>
      </motion.div>
    </div>
  );
}
