import { HeroLayout } from "@/src/layouts/HeroLayout";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import FlappyBird from "@/src/components/FlappyBird";
import TwitterIntentHandler from "@/src/components/TwitterIntentHandler";
import useSWR from "swr";
import Cookie from "js-cookie";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button, Modal, Avatar } from "antd";
import { ExportOutlined, CaretRightOutlined, CheckOutlined, LeftOutlined } from "@ant-design/icons";
import { axiosApi, fetcherStrapi } from "@/utils/axios";

export default function AirdropPage() {
	const { data: session, status } = useSession();
	const { address } = useAccount();
	const [isClientMobile, setIsClientMobile] = useState(false);
	const [currentState, setCurrentState] = useState<"index" | "flap" | "leaderboard">("index");
	const { disconnect } = useDisconnect();
	const { data: ensName } = useEnsName({ address });
	const [domLoaded, setDomLoaded] = useState(false);
	const ensAvatar = useEnsAvatar({ name: ensName ?? "" });
	const { open } = useWeb3Modal();
	const [data, setData] = useState(null);
	const { data: walletData, mutate: walletMutate } = useSWR(
		`/api/wallet-accounts?filters[wallet_address][$eq]=${address}`,
		fetcherStrapi
	);

	useEffect(() => {
		setDomLoaded(true);
		if (typeof window !== "undefined") {
			const userAgent = navigator.userAgent.toLowerCase();
			const isMobileDevice = /mobile|android|iphone|ipad|tablet/.test(userAgent);
			setIsClientMobile(isMobileDevice);
		}
	}, []);

	// 0 connect wallet, 1 twitter social action, 2 congrats, 3 finished
	const [modalStep, setModalStep] = useState(10);

	const [verificationStatus, setVerificationStatus] = useState({
		follow: "unopened",
		retweet: "unopened",
		like: "unopened",
		tweet: "unopened",
	});

	const handleConnectWallet = () => {
		setModalStep(0);
		open();
	};

	const handleOpenLink = (button: string) => {
		setTimeout(() => {
			setVerificationStatus((prevStatus) => ({
				...prevStatus,
				[button]: "unverified",
			}));
		}, 1000);
	};

	const handleVerification = (button: string) => {
		setVerificationStatus((prevStatus) => ({
			...prevStatus,
			[button]: "verifying",
		}));
		const randomDelay = Math.floor(Math.random() * 3000) + 1000; // Random delay between 1 to 4 seconds
		setTimeout(() => {
			setVerificationStatus((prevStatus) => ({
				...prevStatus,
				[button]: "verified",
			}));
		}, randomDelay);
	};

	useEffect(() => {
		var isWallet = true;
		var isTwitter = true;

		// Implement fetch data from database here

		if (!isWallet) {
			setModalStep(0);
		} else if (!isTwitter) {
			setModalStep(1);
		}
	});

	useEffect(() => {
		if (
			verificationStatus.follow === "verified" &&
			verificationStatus.retweet === "verified" &&
			verificationStatus.like === "verified" &&
			verificationStatus.tweet === "verified"
		) {
			setTimeout(() => {
				setModalStep(2);
			}, 2000); // Delay in milliseconds
		}
	}, [verificationStatus]);

	useEffect(() => {
		if (address) {
			if (modalStep < 2) {
				setModalStep(2);
			}
			axiosApi.get(`/api/wallet-accounts?filters[wallet_address][$eq]=${address}`).then((response) => {
				if (response?.data?.data.length === 0) {
					axiosApi
						.post("/api/wallet-accounts", {
							data: {
								wallet_address: address,
							},
						})
						.then((response) => {
							walletMutate();
						})
						.catch((err) => {
							console.log(err);
						});
				}
			});
			Cookie.set("wallet_address", address as string, {
				expires: 1,
			});
		}
	}, [address, walletData]);

	if (!domLoaded) return <div></div>;

	return (
		<HeroLayout>
			<TwitterIntentHandler />
			<div
				style={{ zIndex: 119 }}
				className="flex justify-center items-center w-[80%] md:w-[60%] z-150 mx-auto relative h-[100vh]"
			>
				<div className="bg-white px-6 justify-center items-center md:px-12 py-12 rounded-[22px] mt-[30px] w-full flex flex-col gap-y-[15px] w-[1000px]">
					{currentState === "index" && (
						<div>
							<div className="flex flex-col gap-y-[20px]">
								<div className="flex gap-x-[10px] items-center">
									<p className="font-bold text-black md:text-[16px] text-[12px]">
										1. <span className="underline">complete zealy quests</span>
									</p>
									<div className="p-[5px] rounded-[6px] bg-[#FF6666]">
										<p className="text-[#560000] md:text-[12px] text-[10px]">REQUIRED</p>
									</div>
								</div>
								<div className="flex gap-x-[10px] items-center">
									<p className="md:text-left text-center font-bold md:text-[16px] text-[12px]">
										2. connect wallet and play flappyblast
									</p>
									<div className="p-[5px] rounded-[6px] bg-[#FF6666]">
										<p className="text-[#560000] md:text-[12px] text-[10px]">REQUIRED</p>
									</div>
								</div>
								<p className="md:text-left text-center font-bold md:text-[16px] text-[12px]">
									3. top 100 players will get extra allocation
								</p>
								<p className="md:text-left text-center font-bold md:text-[16px] text-[12px]">
									4. good luck and $FLAP up ;)
								</p>
							</div>
							<div className="flex md:flex-row flex-col gap-x-[40px] justify-center items-center">
								<div
									onClick={() => setCurrentState("flap")}
									className="md:block hidden relative mt-[25px] cursor-pointer"
								>
									<Image width={300} height={100} alt="button" src="/images/flap_button.png" />
								</div>
								<div
									onClick={() => setCurrentState("flap")}
									className="block md:hidden relative mt-[25px] cursor-pointer"
								>
									<Image width={150} height={100} alt="button" src="/images/flap_button.png" />
								</div>
								<div
									onClick={() => setCurrentState("leaderboard")}
									className="md:block hidden relative mt-[25px] cursor-pointer"
								>
									<Image width={300} height={100} alt="button" src="/images/leaderbord_button.png" />
								</div>
								<div
									onClick={() => setCurrentState("leaderboard")}
									className="block md:hidden relative mt-[25px] cursor-pointer"
								>
									<Image width={150} height={100} alt="button" src="/images/leaderbord_button.png" />
								</div>
							</div>
						</div>
					)}
					{currentState === "flap" && (
						<div className="flex flex-col gap-y-[20px] w-full">
							<div className="flex justify-start">
								{!session && (
									<>
										<div
											onClick={() => signIn()}
											className="border border-[#BDBDBD] py-[11px] px-[19px] rounded-[10px] flex gap-x-[10px] cursor-pointer items-center"
										>
											<p className="font-bold md:text-[16px] text-[12px]">Login to X</p>
										</div>
									</>
								)}
								{session && (
									<>
										<div className="flex justify-between w-full">
											<Button
												type="primary"
												onClick={() => signOut()}
												style={{
													border: "2px solid #000",
													borderRadius: "0px",
													backgroundColor: "#fff",
													color: "#000",
												}}
											>
												Logout from X
											</Button>
											<Button
												type="primary"
												onClick={() => setCurrentState("leaderboard")}
												style={{
													border: "2px solid #000",
													borderRadius: "0px",
													backgroundColor: "#fff",
													color: "#000",
												}}
											>
												Leaderboard
											</Button>
										</div>

										<Modal
											centered
											title={
												<div
													style={{
														textAlign: "center",
														fontSize: "24px",
														fontWeight: "bold",
													}}
												>
													X account not eligible yet
												</div>
											}
											open={modalStep == 0}
											footer={null}
											closable={false} // Remove the "X" button
											// maskClosable={false} // Prevent closing by clicking outside
										>
											<div className="flex flex-col gap-2">
												<div className="text-center flex flex-col gap-6 mb-6">
													<div>
														<p>To become eligible, please complete the one-time tasks.</p>
														<p>
															After that, you can play FlappyBlast and easily qualify for
															the airdrop!
														</p>
													</div>
													<div>
														<p>Step 1/2 - Connect Wallet</p>
													</div>
												</div>
												<div className="flex justify-center w-full">
													<div className="w-fit">
														<Button
															type="primary"
															onClick={() => handleConnectWallet()}
															style={{
																border: "2px solid #000",
																borderRadius: "0px",
																backgroundColor: "#fff",
																color: "#000",
															}}
															icon={<ExportOutlined style={{ color: "#000" }} />}
															iconPosition={"end"}
															className="font-bold"
														>
															Connect Wallet
														</Button>
													</div>
												</div>
												<div className="text-center bg-[#F0F0F0] p-4 font-bold mx-6 mt-4">
													NOTICE: This action can only be done once, you will not able to
													change your wallet address connected with you X account with us
												</div>
											</div>
										</Modal>

										<Modal
											centered
											title={
												<div
													style={{
														textAlign: "center",
														fontSize: "24px",
														fontWeight: "bold",
													}}
												>
													X account not eligible yet
												</div>
											}
											open={modalStep == 1}
											footer={null}
											closable={false} // Remove the "X" button
											// maskClosable={false} // Prevent closing by clicking outside
										>
											<div className="flex flex-col gap-2">
												<div className="text-center flex flex-col gap-6 mb-6">
													<div>
														<p>To become eligible, please complete the one-time tasks.</p>
														<p>
															After that, you can play FlappyBlast and easily qualify for
															the airdrop!
														</p>
													</div>
													<div>
														<p>Step 2/2 - Social Campaign</p>
													</div>
												</div>
												<div className="flex justify-between">
													<a
														href="https://twitter.com/intent/follow?screen_name=flappyblast"
														onClick={() => handleOpenLink("follow")}
													>
														<p className=" font-bold">
															1.{" "}
															<span className="underline">Follow @Flappyblast on X</span>
														</p>
													</a>
													{verificationStatus.follow === "unopened" ? (
														<a href="https://twitter.com/intent/follow?screen_name=flappyblast">
															<Button
																type="primary"
																onClick={() => handleOpenLink("follow")}
																icon={<ExportOutlined style={{ color: "#000" }} />}
																iconPosition={"end"}
																style={{
																	border: "2px solid #000",
																	borderRadius: "0px",
																	backgroundColor: "#fff",
																	color: "#000",
																}}
															>
																Follow
															</Button>
														</a>
													) : (
														<Button
															type="primary"
															onClick={() => handleVerification("follow")}
															style={{
																border: "2px solid #000",
																borderRadius: "0px",
																backgroundColor: "#fff",
																color: "#000",
															}}
															loading={
																verificationStatus.follow === "verifying" ? true : false
															}
															icon={
																verificationStatus.follow === "unverified" ? (
																	<CaretRightOutlined style={{ color: "#000" }} />
																) : verificationStatus.follow === "verified" ? (
																	<CheckOutlined style={{ color: "#000" }} />
																) : (
																	false
																)
															}
															iconPosition={"end"}
														>
															{verificationStatus.follow === "verifying"
																? "Verifying..."
																: verificationStatus.follow === "verified"
																? "Verified"
																: "Verify"}
														</Button>
													)}
												</div>
												<div className="flex justify-between">
													<a
														href="https://twitter.com/intent/retweet?tweet_id=463440424141459456"
														onClick={() => handleOpenLink("retweet")}
													>
														<p className=" font-bold">
															2.{" "}
															<span className="underline">
																Retweet @Flappyblast's post on X
															</span>
														</p>
													</a>
													{verificationStatus.retweet === "unopened" ? (
														<a href="https://twitter.com/intent/retweet?tweet_id=463440424141459456">
															<Button
																type="primary"
																onClick={() => handleOpenLink("retweet")}
																style={{
																	border: "2px solid #000",
																	borderRadius: "0px",
																	backgroundColor: "#fff",
																	color: "#000",
																}}
																icon={<ExportOutlined style={{ color: "#000" }} />}
																iconPosition={"end"}
															>
																Retweet
															</Button>
														</a>
													) : (
														<Button
															type="primary"
															onClick={() => handleVerification("retweet")}
															style={{
																border: "2px solid #000",
																borderRadius: "0px",
																backgroundColor: "#fff",
																color: "#000",
															}}
															loading={
																verificationStatus.retweet === "verifying"
																	? true
																	: false
															}
															icon={
																verificationStatus.retweet === "unverified" ? (
																	<CaretRightOutlined style={{ color: "#000" }} />
																) : verificationStatus.retweet === "verified" ? (
																	<CheckOutlined style={{ color: "#000" }} />
																) : (
																	false
																)
															}
															iconPosition={"end"}
														>
															{verificationStatus.retweet === "verifying"
																? "Verifying..."
																: verificationStatus.retweet === "verified"
																? "Verified"
																: "Verify"}
														</Button>
													)}
												</div>
												<div className="flex justify-between">
													<a
														href="https://twitter.com/intent/like?tweet_id=463440424141459456"
														onClick={() => handleOpenLink("like")}
													>
														<p className=" font-bold">
															3.{" "}
															<span className="underline">
																Like @Flappyblast's post on X
															</span>
														</p>
													</a>
													{verificationStatus.like === "unopened" ? (
														<a href="https://twitter.com/intent/like?tweet_id=463440424141459456">
															<Button
																type="primary"
																onClick={() => handleOpenLink("like")}
																style={{
																	border: "2px solid #000",
																	borderRadius: "0px",
																	backgroundColor: "#fff",
																	color: "#000",
																}}
																icon={<ExportOutlined style={{ color: "#000" }} />}
																iconPosition={"end"}
															>
																Like
															</Button>
														</a>
													) : (
														<Button
															type="primary"
															onClick={() => handleVerification("like")}
															style={{
																border: "2px solid #000",
																borderRadius: "0px",
																backgroundColor: "#fff",
																color: "#000",
															}}
															loading={
																verificationStatus.like === "verifying" ? true : false
															}
															icon={
																verificationStatus.like === "unverified" ? (
																	<CaretRightOutlined style={{ color: "#000" }} />
																) : verificationStatus.like === "verified" ? (
																	<CheckOutlined style={{ color: "#000" }} />
																) : (
																	false
																)
															}
															iconPosition={"end"}
														>
															{verificationStatus.like === "verifying"
																? "Verifying..."
																: verificationStatus.like === "verified"
																? "Verified"
																: "Verify"}
														</Button>
													)}
												</div>
												<div className="flex justify-between">
													<a
														href="https://twitter.com/intent/tweet?text=Hello%20world&hashtags=yrdy"
														onClick={() => handleOpenLink("tweet")}
													>
														<p className=" font-bold">
															4.{" "}
															<span className="underline">
																Tweet about @Flappyblast on X
															</span>
														</p>
													</a>
													{verificationStatus.tweet === "unopened" ? (
														<a href="https://twitter.com/intent/tweet?text=Hello%20world&hashtags=yrdy">
															<Button
																type="primary"
																onClick={() => handleOpenLink("tweet")}
																style={{
																	border: "2px solid #000",
																	borderRadius: "0px",
																	backgroundColor: "#fff",
																	color: "#000",
																}}
																icon={<ExportOutlined style={{ color: "#000" }} />}
																iconPosition={"end"}
															>
																Tweet
															</Button>
														</a>
													) : (
														<Button
															type="primary"
															onClick={() => handleVerification("tweet")}
															style={{
																border: "2px solid #000",
																borderRadius: "0px",
																backgroundColor: "#fff",
																color: "#000",
															}}
															loading={
																verificationStatus.tweet === "verifying" ? true : false
															}
															icon={
																verificationStatus.tweet === "unverified" ? (
																	<CaretRightOutlined style={{ color: "#000" }} />
																) : verificationStatus.tweet === "verified" ? (
																	<CheckOutlined style={{ color: "#000" }} />
																) : (
																	false
																)
															}
															iconPosition={"end"}
														>
															{verificationStatus.tweet === "verifying"
																? "Verifying..."
																: verificationStatus.tweet === "verified"
																? "Verified"
																: "Verify"}
														</Button>
													)}
												</div>
											</div>
										</Modal>

										<Modal
											centered
											title={
												<div
													style={{
														textAlign: "center",
														fontSize: "24px",
														fontWeight: "bold",
													}}
												>
													Your X account is eligible for airdrop 🎉
												</div>
											}
											open={modalStep == 2}
											onCancel={() => setModalStep(3)}
											footer={null}
											closable={false}
										>
											<div className="text-center my-6">
												<p>
													Congrats! Just play Flappyblast and share your scores with us! Join
													our fun Discord community to share and compare. &nbsp;
													<span className="underline">Join here!</span>
												</p>
											</div>
										</Modal>
									</>
								)}
							</div>
							<div className={`rounded-[8px] w-full ${modalStep < 3 || !session ? "bg-[#F1F1F1]" : ""}`}>
								<div
									className={`flex flex-col justify-center${
										modalStep < 3 || !session ? "mx-6 my-12" : ""
									}`}
								>
									{modalStep === 0 || !session ? (
										<p className="text-center">Login to Twitter to play FlappyBlast</p>
									) : modalStep > 0 && modalStep < 3 ? (
										<p className="text-center">Complete tasks to play FlappyBlast</p>
									) : isClientMobile ? (
										<p className="text-center">Please use a desktop to play the game.</p>
									) : (
										<FlappyBird />
									)}
								</div>
							</div>
						</div>
					)}
					{currentState === "leaderboard" && (
						<>
							<div className="flex flex-row justify-between w-full">
								<div className="pixel-caps text-2xl font-bold">LEADERBOARDS</div>
								<Button
									type="primary"
									onClick={() => setCurrentState("flap")}
									style={{
										border: "2px solid #000",
										borderRadius: "0px",
										backgroundColor: "#fff",
										color: "#000",
									}}
									icon={<LeftOutlined style={{ color: "#000" }} />}
									iconPosition={"start"}
								>
									Return to the game
								</Button>
							</div>

							<div className="overflow-y-auto max-h-96 w-full mt-6">
								<table className="w-full">
									<thead className="pixel-caps bg-white sticky top-0 z-20">
										<tr className="table-header">
											<th className="py-2 px-4">RANK</th>
											<th className="py-2 px-4">PP</th>
											<th className="py-2 px-4">TWITTER NAME</th>
											<th className="py-2 px-4">POINTS</th>
										</tr>
									</thead>
									<tbody>
										{Array.from({ length: 50 }, (_, index) => (
											<tr className="table-row text-center border-black border-b-2 border-dashed">
												<td className="py-4 px-4 whitespace-nowrap">{index + 1}</td>
												<td className="py-4 px-4 whitespace-nowrap">
													<div className="flex justify-center">
														<Avatar
															src={
																<img
																	src={
																		"https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
																	}
																	alt="avatar"
																/>
															}
														/>
													</div>
												</td>
												<td className="py-4 px-4 whitespace-nowrap">Data 3</td>
												<td className="py-4 px-4 whitespace-nowrap">Data 4</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</>
					)}
				</div>
			</div>
		</HeroLayout>
	);
}
