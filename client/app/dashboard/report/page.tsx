"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import GradeCard from "@/component/card/gradeCard";
import ProfileCard from "@/component/card/profileCard";
import DescribeCard from "@/component/card/describeCard";
import PointCard from "@/component/card/pointCard";
import TechStackCard from "@/component/card/techStackCard";

function ReportPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [token, setToken] = useState("");
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res : any = await axios.get("http://localhost:8000/auth/status", {
          withCredentials: true,
        });

        if (res.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserData(res.data.user);
          console.log("data: ", res.data);

          if (res.data.user?.githubAccessToken) {
            setToken(res.data.user.githubAccessToken);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth Status Error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleProfile = async () => {
    try {
      const res = {};
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleDescribe = async () => {};

  return (
    <div className="min-h-screen bg-[#FAFAFC] py-12 px-6 flex justify-center font-sans">
      <div className="max-w-275 w-full flex flex-col gap-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <ProfileCard
            imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbH81GnvBPAOl6QGuKAGQzFSvy-cfuht7Y9Q&s"
            name="Yossapat Rasri"
            position="Software Engineer"
          />
          <GradeCard point={49} grade="F" />
        </div>

        <div className="w-full">
          <DescribeCard describe="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos incidunt temporibus quaerat aspernatur totam delectus recusandae, esse voluptatibus rem dolor provident fugit labore unde itaque, ad, quos cum repellat sint suscipit alias est similique! Saepe quae atque unde laborum dolore, rem cum sint. Corporis odit earum nulla ea eveniet quas?" />
        </div>

        <div>
          <h2 className="text-[28px] font-medium text-black mb-6 tracking-tight">
            Skill Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
            <PointCard
              topic="Documentation"
              explain="เอกสารโปรเจกต์ครบถ้วนและชัดเจน"
              point={15}
            />
          </div>
        </div>

        <div>
          <h2 className="text-[28px] font-medium text-black mb-6 tracking-tight">
            Main Stack
          </h2>
          <div className="flex flex-wrap gap-4">
            <TechStackCard />
            <TechStackCard />
            <TechStackCard />
            <TechStackCard />
            <TechStackCard />
            <TechStackCard />
            <TechStackCard />
            <TechStackCard />
          </div>
        </div>

        <div>
          <h2 className="text-[28px] font-medium text-black mb-6 tracking-tight">
            Verified Source
          </h2>
          <ul className="flex flex-col gap-4 pl-6 text-lg text-gray-800 list-disc marker:text-black">
            <li>
              <strong>GitSkill</strong> <ExternalLinkIcon /> : ทำเกี่ยวกับบลาๆ
              บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ
            </li>
            <li>
              <strong>archaeological-site</strong> <ExternalLinkIcon /> :
              ทำเกี่ยวกับบลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ
            </li>
            <li>
              <strong>Port_Simulation</strong> <ExternalLinkIcon /> :
              ทำเกี่ยวกับบลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ
            </li>
            <li>
              <strong>WongNok</strong> <ExternalLinkIcon /> : ทำเกี่ยวกับบลาๆ
              บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ บลาๆ
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block w-5 h-5 ml-1 text-gray-600 align-text-bottom"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

export default ReportPage;
