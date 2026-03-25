#!/usr/bin/env node

const API_BASE = "http://localhost:3000/api";
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}\n`),
  test: (msg) => console.log(`${colors.yellow}→ Testing: ${msg}${colors.reset}`),
};

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Store cookies for each user separately
let teacherCookies = {};
let studentCookies = {};

function updateCookies(setCookieHeader, target = "both") {
  if (!setCookieHeader) return;
  const parts = setCookieHeader.split(';')[0].split('=');
  if (parts.length === 2) {
    if (target === "teacher" || target === "both") teacherCookies[parts[0]] = parts[1];
    if (target === "student" || target === "both") studentCookies[parts[0]] = parts[1];
  }
}

function getTeacherCookieHeader() {
  return Object.entries(teacherCookies).map(([key, val]) => `${key}=${val}`).join('; ');
}

function getStudentCookieHeader() {
  return Object.entries(studentCookies).map(([key, val]) => `${key}=${val}`).join('; ');
}

async function runTests() {
  log.section("COMPREHENSIVE PROJECT TEST - WITH EMAIL VERIFICATION");

  const timestamp = Date.now();
  const teacherEmail = `teacher_comp${timestamp}@test.com`;
  const studentEmail = `student_comp${timestamp}@test.com`;
  const password = "TestPassword123!";

  let tests = 0;
  let passed = 0;
  let failed = 0;
  let courseId = null;
  let chapterId = null;
  let teacherSessionToken = null;
  let studentSessionToken = null;

  const test = async (name, fn) => {
    tests++;
    log.test(name);
    try {
      await fn();
      log.success(name);
      passed++;
    } catch (error) {
      log.error(`${name}: ${error.message}`);
      failed++;
    }
    await delay(300);
  };

  try {
    // ===== REGISTRATION & VERIFICATION =====
    log.section("1. REGISTRATION & VERIFICATION");

    let teacherToken = null;
    let studentToken = null;

    await test("Register teacher account", async () => {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: teacherEmail,
          password: password,
          name: "Comprehensive Teacher",
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log("Register response:", JSON.stringify(data, null, 2));
      if (data.verification_token) teacherToken = data.verification_token;
    });

    await test("Register student account", async () => {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: studentEmail,
          password: password,
          name: "Comprehensive Student",
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.verification_token) studentToken = data.verification_token;
    });

    // Verify emails using the actual verification codes
    await test("Verify teacher email", async () => {
      // Get the verification code
      const codeResponse = await fetch("http://localhost:3000/api/debug/get-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teacherEmail }),
      });

      if (!codeResponse.ok) {
        const errText = await codeResponse.text();
        console.log("Debug endpoint response:", codeResponse.status, errText);
        throw new Error("Could not get verification code");
      }

      const codeData = await codeResponse.json();
      
      const response = await fetch("http://localhost:3000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: codeData.code,
        }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) updateCookies(setCookie);
    });

    await test("Verify student email", async () => {
      const codeResponse = await fetch("http://localhost:3000/api/debug/get-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentEmail }),
      });

      if (!codeResponse.ok) {
        throw new Error("Could not get verification code");
      }

      const codeData = await codeResponse.json();
      
      const response = await fetch("http://localhost:3000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: codeData.code,
        }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) updateCookies(setCookie);
    });

    // ===== LOGIN =====
    log.section("2. LOGIN");

    await test("Login teacher", async () => {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: teacherEmail,
          password: password,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      
      // Store teacher session cookie
      const setCookie = response.headers.get('set-cookie');
      console.log("Teacher Login Set-Cookie:", setCookie);
      updateCookies(setCookie, "teacher");
      console.log("Teacher cookies:", teacherCookies);
    });

    await test("Login student", async () => {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: studentEmail,
          password: password,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const setCookie = response.headers.get('set-cookie');
      console.log("Student Login Set-Cookie:", setCookie);
      updateCookies(setCookie, "student");
      console.log("Student cookies:", studentCookies);
    });

    // ===== COURSE MANAGEMENT =====
    log.section("3. COURSE MANAGEMENT");

    await test("Set teacher role", async () => {
      const response = await fetch("http://localhost:3000/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: teacherEmail,
          role: "TEACHER",
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    });

    await test("Create course", async () => {
      const cookieHeader = getTeacherCookieHeader();
      console.log("📤 Create course with teacher cookies:");
      console.log("  Cookie:", cookieHeader);
      
      const response = await fetch("http://localhost:3000/api/courses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Cookie": cookieHeader 
        },
        credentials: "include",
        body: JSON.stringify({
          title: `Comprehensive Test Course ${timestamp}`,
          description: "This is a comprehensive test course with chapters and progress tracking",
          price: 89.99,
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      const data = await response.json();
      courseId = data.id;
      if (!courseId) throw new Error("No course ID returned");
    });

    await test("Get all courses (public)", async () => {
      const response = await fetch("http://localhost:3000/api/courses", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Expected array of courses");
    });

    await test("Create chapter", async () => {
      const response = await fetch("http://localhost:3000/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cookie": getTeacherCookieHeader() },
        credentials: "include",
        body: JSON.stringify({
          courseId: courseId,
          title: "Chapter 1: Introduction",
          description: "Learn the basics",
          position: 1,
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      const data = await response.json();
      chapterId = data.id;
      if (!chapterId) throw new Error("No chapter ID returned");
    });

    // ===== PROGRESS TRACKING =====
    log.section("4. PROGRESS TRACKING");

    await test("Track progress", async () => {
      const response = await fetch("http://localhost:3000/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cookie": getStudentCookieHeader() },
        credentials: "include",
        body: JSON.stringify({
          chapterId: chapterId,
          isCompleted: true,
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    });

    await test("Get progress", async () => {
      const response = await fetch(`http://localhost:3000/api/progress/${chapterId}`, {
        method: "GET",
        headers: { "Cookie": getStudentCookieHeader() },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    });

    // ===== SUMMARY =====
    log.section("TEST SUMMARY");

  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
  }

  console.log(`\n${colors.cyan}Results: ${passed}/${tests} passed, ${failed} failed${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
