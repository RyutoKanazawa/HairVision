import React, { useState } from "react";
import axios from "axios";
import "../styles/UploadPage.css";

export const UploadPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [gender, setGender] = useState(""); // 性別を選択していない状態
    const [showUploadButton, setShowUploadButton] = useState(false); // アップロードボタンの表示状態
    const [responseData, setResponseData] = useState(null); // サーバーからのレスポンスデータ
    const [uploadedImagePreview, setUploadedImagePreview] = useState(null); // 提出した写真のプレビュー
    const [uploadError, setUploadError] = useState(""); // アップロードエラーの状態

    const handleGenderSelect = (selectedGender) => {
        setGender(selectedGender);
        setShowUploadButton(true); // 性別選択後にアップロードボタンを表示
        setUploadError(""); // 性別選択後にエラーメッセージをクリア
        // 画像プレビューとレスポンスデータをリセット
        setUploadedImagePreview(null);
        setResponseData(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setUploadedImagePreview(URL.createObjectURL(file)); // ファイルプレビューを作成
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError("Please select a file before uploading.");
            return;
        }
        if (!gender) {
            setUploadError("Please select a gender first.");
            return;
        }

        // アップロードエラーをリセット
        setUploadError("");

        // アップロードボタンを押すときに画像プレビューをリセットし、新しいプレビューを表示
        setUploadedImagePreview(URL.createObjectURL(selectedFile));

        const formData = new FormData();
        formData.append("image", selectedFile);

        // 選択した性別に応じてエンドポイントを変更
        const endpoint = gender === "male" ? "/uploads_py_male" : "/uploads_py_female";
        const fullUrl = `http://localhost:5003${endpoint}`;  // ポート5003に変更

        try {
            const response = await axios.post(fullUrl, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Server response:", response.data); // レスポンスデータを確認
            setResponseData(response.data); // サーバーからのレスポンスを保存
        } catch (error) {
            console.error("Error uploading the file:", error);
            setUploadError("An error occurred while processing the image.");
        }
    };

    return (
        <div className="upload-page">
            <h1>Upload and Process Image</h1>

            {/* 性別選択ボタン */}
            <div className="gender-selection">
                <button
                    className={`gender-button ${gender === "male" ? "selected" : ""}`}
                    onClick={() => handleGenderSelect("male")}
                >
                    Male
                </button>
                <button
                    className={`gender-button ${gender === "female" ? "selected" : ""}`}
                    onClick={() => handleGenderSelect("female")}
                >
                    Female
                </button>
            </div>

            {/* エラーメッセージの表示 */}
            {uploadError && <p className="error-message">{uploadError}</p>}

            {/* ファイルアップロードセクション */}
            {showUploadButton && (
                <div className="upload-form">
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    <button onClick={handleUpload} className="upload-button">Upload</button> {/* おしゃれなボタン */}
                </div>
            )}

            {/* 結果表示 */}
            {responseData && (
                <div className="result">
                    <h2>Results</h2>

                    {/* 顔のタイプを横並びで表示 */}
                    <div className="face-type">
                        <h3>Face Type: {responseData.face_type === "Round face" ? "Round face" : "Slender face"}</h3>
                    </div>

                    {/* 提出した写真と推薦された髪型画像を横並びに表示 */}
                    <div className="images-row">
                        <div className="image-container">
                            <h3>Your Uploaded Image</h3>
                            {uploadedImagePreview && (
                                <img
                                    src={uploadedImagePreview}
                                    alt="Uploaded"
                                    className="uploaded-image"
                                />
                            )}
                        </div>

                        {/* 推薦された髪型 */}
                        <div className="image-container">
                            <h3>Recommended Hairstyle</h3>
                            {responseData.recommended_image ? (
                                <img
                                    src={`http://localhost:5003${responseData.recommended_image}`}
                                    alt="Recommended"
                                    className="recommended-image"
                                />
                            ) : (
                                <p>No recommended hairstyle available</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};